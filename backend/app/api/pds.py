from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import random
from app.db.session import get_db
from app.db.models import (
    Beneficiary, RationCard, BeneficiaryEntitlement, Commodity,
    PdsStock, StockReceipt, StockAdjustment, PdsTransaction,
    PdsTransactionItem, Alert, AuditLog
)
from app.schemas.schemas import (
    BeneficiaryOut, BeneficiaryCreate, CommodityOut,
    PdsStockOut, StockReceiptCreate, StockReconcileRequest,
    DistributionRequest, TransactionOut
)

router = APIRouter(prefix="/pds", tags=["Public Distribution System"])

@router.get("/commodities", response_model=List[CommodityOut])
def get_commodities(db: Session = Depends(get_db)):
    return db.query(Commodity).filter(Commodity.is_active == True).all()

@router.get("/beneficiaries")
def get_beneficiaries(
    village_id: Optional[str] = None,
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    q = db.query(Beneficiary).join(RationCard)
    if village_id:
        q = q.filter(Beneficiary.village_id == village_id)
    if category and category != "ALL":
        q = q.filter(RationCard.category == category)
    if search:
        s = f"%{search}%"
        q = q.filter((Beneficiary.name.ilike(s)) | (Beneficiary.beneficiary_code.ilike(s)) | (RationCard.card_number.ilike(s)))

    beneficiaries = q.limit(limit).all()
    results = []
    current_month = datetime.datetime.utcnow().strftime("%Y-%m")

    for b in beneficiaries:
        entitlements_out = []
        for e in b.entitlements:
            if e.quota_month == current_month:
                rem = max(0.0, e.monthly_quota - e.current_month_consumed)
                entitlements_out.append({
                    "commodity_id": e.commodity_id,
                    "commodity_name": e.commodity.name,
                    "unit": e.commodity.unit,
                    "monthly_quota": e.monthly_quota,
                    "current_month_consumed": e.current_month_consumed,
                    "remaining_quota": rem,
                    "unit_price": e.commodity.subsidized_price
                })
        results.append({
            "id": b.id,
            "beneficiary_code": b.beneficiary_code,
            "name": b.name,
            "name_mr": b.name_mr,
            "head_of_family": b.head_of_family,
            "family_members_count": b.family_members_count,
            "contact_phone": b.contact_phone,
            "address": b.address,
            "status": b.status,
            "village_id": b.village_id,
            "village_name": b.village.name if b.village else "Unknown",
            "ration_card_number": b.ration_card.card_number if b.ration_card else "N/A",
            "ration_card_category": b.ration_card.category if b.ration_card else "N/A",
            "ration_card_color": b.ration_card.color if b.ration_card else "N/A",
            "entitlements": entitlements_out
        })
    return results

@router.post("/beneficiaries")
def create_beneficiary(req: BeneficiaryCreate, db: Session = Depends(get_db)):
    # Check duplicate card number
    if db.query(RationCard).filter(RationCard.card_number == req.ration_card_number).first():
        raise HTTPException(status_code=400, detail="Ration card number already exists in system")

    # Create ration card
    rc = RationCard(
        card_number=req.ration_card_number,
        category=req.ration_card_category,
        color=req.ration_card_color,
        is_active=True
    )
    db.add(rc)
    db.flush()

    ben_code = f"BEN-{datetime.datetime.utcnow().year}-{random.randint(1000, 9999)}"
    ben = Beneficiary(
        beneficiary_code=ben_code,
        name=req.name,
        name_mr=req.name_mr or req.name,
        head_of_family=req.head_of_family,
        family_members_count=req.family_members_count,
        contact_phone=req.contact_phone,
        address=req.address,
        status="ACTIVE",
        village_id=req.village_id,
        ration_card_id=rc.id
    )
    db.add(ben)
    db.flush()

    # Create standard entitlements for current month
    current_month = datetime.datetime.utcnow().strftime("%Y-%m")
    commodities = db.query(Commodity).filter(Commodity.is_active == True).all()

    quota_map = {
        "AAY": {"RICE": 20.0, "WHEAT": 15.0, "SUGAR": 2.0, "OIL": 1.0, "KEROSENE": 2.0},
        "PHH": {"RICE": 12.0, "WHEAT": 8.0, "SUGAR": 1.0, "OIL": 1.0, "KEROSENE": 1.0},
        "APL": {"RICE": 8.0, "WHEAT": 5.0, "SUGAR": 1.0, "OIL": 0.5, "KEROSENE": 0.0}
    }
    cat_quotas = quota_map.get(req.ration_card_category, quota_map["PHH"])

    for c in commodities:
        q_val = cat_quotas.get(c.code, 5.0)
        db.add(BeneficiaryEntitlement(
            beneficiary_id=ben.id,
            commodity_id=c.id,
            monthly_quota=q_val,
            current_month_consumed=0.0,
            quota_month=current_month
        ))

    db.add(AuditLog(
        module="PDS",
        action="BENEFICIARY_REGISTERED",
        description=f"Beneficiary '{ben.name}' ({ben.beneficiary_code}) registered with card '{rc.card_number}'.",
        performed_by="Operator"
    ))

    db.commit()
    return {"message": "Beneficiary registered successfully", "id": ben.id, "beneficiary_code": ben_code}

@router.get("/verify")
def verify_ration_card(query: str, village_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Fast verification for PDS distribution screen."""
    clean_q = query.strip()
    ben = db.query(Beneficiary).join(RationCard).filter(
        (RationCard.card_number.ilike(clean_q)) | (Beneficiary.beneficiary_code.ilike(clean_q))
    ).first()

    if not ben:
        raise HTTPException(status_code=404, detail="No beneficiary or ration card matched this identifier.")

    current_month = datetime.datetime.utcnow().strftime("%Y-%m")
    v_id = village_id or ben.village_id

    # Gather entitlements and cross-reference with available village stock
    eligible_items = []
    has_pending_quota = False

    for e in ben.entitlements:
        if e.quota_month == current_month:
            rem = max(0.0, e.monthly_quota - e.current_month_consumed)
            stock = db.query(PdsStock).filter(
                PdsStock.village_id == v_id,
                PdsStock.commodity_id == e.commodity_id
            ).first()
            avail_stock = stock.current_stock if stock else 0.0

            if rem > 0:
                has_pending_quota = True

            eligible_items.append({
                "commodity_id": e.commodity_id,
                "commodity_code": e.commodity.code,
                "commodity_name": e.commodity.name,
                "unit": e.commodity.unit,
                "subsidized_price": e.commodity.subsidized_price,
                "monthly_quota": e.monthly_quota,
                "current_month_consumed": e.current_month_consumed,
                "remaining_quota": rem,
                "available_stock": avail_stock,
                "can_distribute": (rem > 0 and avail_stock > 0)
            })

    return {
        "verified": True,
        "beneficiary": {
            "id": ben.id,
            "beneficiary_code": ben.beneficiary_code,
            "name": ben.name,
            "name_mr": ben.name_mr,
            "head_of_family": ben.head_of_family,
            "family_members_count": ben.family_members_count,
            "contact_phone": ben.contact_phone,
            "address": ben.address,
            "status": ben.status,
            "village_id": ben.village_id,
            "village_name": ben.village.name if ben.village else "Unknown",
            "ration_card_number": ben.ration_card.card_number,
            "ration_card_category": ben.ration_card.category,
            "ration_card_color": ben.ration_card.color,
            "is_card_active": ben.ration_card.is_active
        },
        "month_period": current_month,
        "has_pending_quota": has_pending_quota,
        "items": eligible_items
    }

@router.get("/stocks")
def get_stocks(village_id: Optional[str] = None, db: Session = Depends(get_db)):
    v_id = village_id or "v-shiva"
    stocks = db.query(PdsStock).filter(PdsStock.village_id == v_id).all()
    results = []
    for s in stocks:
        is_low = s.current_stock <= s.commodity.min_stock_alert_threshold
        results.append({
            "id": s.id,
            "village_id": s.village_id,
            "commodity_id": s.commodity_id,
            "commodity_name": s.commodity.name,
            "commodity_code": s.commodity.code,
            "unit": s.commodity.unit,
            "subsidized_price": s.commodity.subsidized_price,
            "opening_stock": s.opening_stock,
            "current_stock": s.current_stock,
            "received_stock_month": s.received_stock_month,
            "distributed_stock_month": s.distributed_stock_month,
            "adjusted_stock_month": s.adjusted_stock_month,
            "physical_stock_verified": s.physical_stock_verified,
            "min_threshold": s.commodity.min_stock_alert_threshold,
            "is_low_stock": is_low,
            "last_reconciliation_date": s.last_reconciliation_date
        })
    return results

@router.post("/stocks/receipt")
def add_stock_receipt(req: StockReceiptCreate, db: Session = Depends(get_db)):
    stock = db.query(PdsStock).filter(
        PdsStock.village_id == req.village_id,
        PdsStock.commodity_id == req.commodity_id
    ).first()

    if not stock:
        # Create stock entry if not exists
        stock = PdsStock(
            village_id=req.village_id,
            commodity_id=req.commodity_id,
            opening_stock=0.0,
            current_stock=0.0,
            received_stock_month=0.0,
            distributed_stock_month=0.0
        )
        db.add(stock)
        db.flush()

    stock.current_stock += req.quantity
    stock.received_stock_month += req.quantity
    stock.updated_at = datetime.datetime.utcnow()

    grn_code = f"GRN-{datetime.datetime.utcnow().year}-{random.randint(1000, 9999)}"
    receipt = StockReceipt(
        receipt_no=grn_code,
        village_id=req.village_id,
        commodity_id=req.commodity_id,
        quantity=req.quantity,
        supplier_challan_no=req.supplier_challan_no,
        batch_no=req.batch_no,
        received_by=req.received_by,
        notes=req.notes
    )
    db.add(receipt)

    db.add(AuditLog(
        module="PDS",
        action="STOCK_RECEIVED",
        description=f"Received {req.quantity} {stock.commodity.unit} of {stock.commodity.name} under {grn_code}.",
        performed_by=req.received_by
    ))

    db.commit()
    return {"message": "Stock receipt added successfully", "receipt_no": grn_code, "new_stock": stock.current_stock}

@router.post("/stocks/reconcile")
def reconcile_stock(req: StockReconcileRequest, db: Session = Depends(get_db)):
    stock = db.query(PdsStock).filter(
        PdsStock.village_id == req.village_id,
        PdsStock.commodity_id == req.commodity_id
    ).first()

    if not stock:
        raise HTTPException(status_code=404, detail="Stock record not found")

    expected_stock = stock.opening_stock + stock.received_stock_month - stock.distributed_stock_month + stock.adjusted_stock_month
    mismatch = req.physical_stock - expected_stock

    stock.physical_stock_verified = req.physical_stock
    stock.last_reconciliation_date = datetime.datetime.utcnow()
    stock.current_stock = req.physical_stock # updated to physical verified

    # Record adjustment
    adj = StockAdjustment(
        village_id=req.village_id,
        commodity_id=req.commodity_id,
        expected_stock=expected_stock,
        physical_stock=req.physical_stock,
        mismatch_quantity=mismatch,
        explanation=req.explanation,
        adjusted_by=req.operator_name,
        status="APPROVED" if abs(mismatch) < 2.0 else "FLAGGED"
    )
    db.add(adj)

    # If significant mismatch, generate critical Alert
    if abs(mismatch) > 5.0:
        db.add(Alert(
            module="PDS",
            severity="CRITICAL" if abs(mismatch) > 20.0 else "WARNING",
            title=f"Stock Mismatch Detected: {stock.commodity.name} ({mismatch:+.1f} {stock.commodity.unit})",
            message=f"Physical stock ({req.physical_stock}) differed from expected closing stock ({expected_stock}). Explanation: {req.explanation}",
            source_asset=f"PDS Godown ({stock.commodity.name})",
            village_id=req.village_id
        ))

    db.add(AuditLog(
        module="PDS",
        action="STOCK_RECONCILED",
        description=f"Reconciled {stock.commodity.name}. Expected: {expected_stock}, Physical: {req.physical_stock}, Mismatch: {mismatch:+.1f}. Reason: {req.explanation}",
        performed_by=req.operator_name
    ))

    db.commit()
    return {
        "message": "Stock reconciliation completed",
        "expected_stock": expected_stock,
        "physical_stock": req.physical_stock,
        "mismatch": mismatch,
        "has_mismatch": abs(mismatch) > 0.1
    }

@router.post("/distribute")
def distribute_ration(req: DistributionRequest, db: Session = Depends(get_db)):
    """ATOMIC ration distribution transaction."""
    ben = db.query(Beneficiary).filter(Beneficiary.id == req.beneficiary_id).first()
    if not ben:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    if ben.status != "ACTIVE":
        raise HTTPException(status_code=400, detail=f"Beneficiary is {ben.status}. Distribution blocked.")

    current_month = datetime.datetime.utcnow().strftime("%Y-%m")
    total_cost = 0.0
    items_to_save = []

    # 1. Validation pass
    for item in req.items:
        if item.quantity <= 0:
            continue

        commodity = db.query(Commodity).filter(Commodity.id == item.commodity_id).first()
        if not commodity:
            raise HTTPException(status_code=404, detail=f"Commodity ID {item.commodity_id} not found")

        # Entitlement check
        entitlement = db.query(BeneficiaryEntitlement).filter(
            BeneficiaryEntitlement.beneficiary_id == ben.id,
            BeneficiaryEntitlement.commodity_id == commodity.id,
            BeneficiaryEntitlement.quota_month == current_month
        ).first()

        if not entitlement:
            raise HTTPException(status_code=400, detail=f"No entitlement configured for {commodity.name} this month")

        remaining = max(0.0, entitlement.monthly_quota - entitlement.current_month_consumed)
        if item.quantity > remaining:
            raise HTTPException(
                status_code=400,
                detail=f"Requested {item.quantity} {commodity.unit} exceeds remaining monthly quota ({remaining} {commodity.unit}) for {commodity.name}"
            )

        # Stock check
        stock = db.query(PdsStock).filter(
            PdsStock.village_id == req.village_id,
            PdsStock.commodity_id == commodity.id
        ).with_for_update().first() # lock stock row for atomic transaction

        if not stock or stock.current_stock < item.quantity:
            avail = stock.current_stock if stock else 0.0
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for {commodity.name}. Available: {avail} {commodity.unit}, Requested: {item.quantity} {commodity.unit}"
            )

        subtotal = round(item.quantity * commodity.subsidized_price, 2)
        total_cost += subtotal
        items_to_save.append({
            "entitlement": entitlement,
            "stock": stock,
            "commodity": commodity,
            "quantity": item.quantity,
            "subtotal": subtotal
        })

    if not items_to_save:
        raise HTTPException(status_code=400, detail="No valid items provided for distribution")

    # 2. Execution pass (Atomic)
    txn_code = f"TXN-{current_month.replace('-', '')}-{random.randint(1000, 9999)}"
    txn = PdsTransaction(
        transaction_code=txn_code,
        beneficiary_id=ben.id,
        village_id=req.village_id,
        operator_name=req.operator_name,
        total_amount=round(total_cost, 2),
        month_period=current_month,
        verification_mode="BIOMETRIC_SIMULATED",
        status="SUCCESS",
        created_at=datetime.datetime.utcnow()
    )
    db.add(txn)
    db.flush()

    receipt_items = []
    for item_data in items_to_save:
        qty = item_data["quantity"]
        comm = item_data["commodity"]
        stock = item_data["stock"]
        ent = item_data["entitlement"]

        # Decrement stock
        stock.current_stock = round(stock.current_stock - qty, 2)
        stock.distributed_stock_month = round(stock.distributed_stock_month + qty, 2)
        stock.updated_at = datetime.datetime.utcnow()

        # Update beneficiary quota consumed
        ent.current_month_consumed = round(ent.current_month_consumed + qty, 2)

        # Add transaction item
        t_item = PdsTransactionItem(
            transaction_id=txn.id,
            commodity_id=comm.id,
            commodity_name=comm.name,
            quantity=qty,
            unit=comm.unit,
            unit_price=comm.subsidized_price,
            subtotal=item_data["subtotal"]
        )
        db.add(t_item)
        receipt_items.append({
            "commodity_name": comm.name,
            "quantity": qty,
            "unit": comm.unit,
            "unit_price": comm.subsidized_price,
            "subtotal": item_data["subtotal"]
        })

    db.add(AuditLog(
        module="PDS",
        action="RATION_DISTRIBUTION",
        description=f"Distributed ration under {txn_code} to {ben.name} ({ben.ration_card.card_number}). Total: Rs {total_cost:.2f}.",
        performed_by=req.operator_name
    ))

    db.commit()

    return {
        "success": True,
        "transaction_code": txn_code,
        "beneficiary_name": ben.name,
        "beneficiary_code": ben.beneficiary_code,
        "ration_card_number": ben.ration_card.card_number,
        "village_id": req.village_id,
        "village_name": ben.village.name if ben.village else "Unknown",
        "operator_name": req.operator_name,
        "total_amount": round(total_cost, 2),
        "month_period": current_month,
        "timestamp": txn.created_at.isoformat(),
        "items": receipt_items
    }

@router.get("/transactions")
def get_transactions(village_id: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    q = db.query(PdsTransaction).join(Beneficiary)
    if village_id:
        q = q.filter(PdsTransaction.village_id == village_id)

    txns = q.order_by(PdsTransaction.created_at.desc()).limit(limit).all()
    results = []
    for t in txns:
        items_out = []
        for it in t.items:
            items_out.append({
                "commodity_name": it.commodity_name,
                "quantity": it.quantity,
                "unit": it.unit,
                "unit_price": it.unit_price,
                "subtotal": it.subtotal
            })
        results.append({
            "id": t.id,
            "transaction_code": t.transaction_code,
            "beneficiary_id": t.beneficiary_id,
            "beneficiary_name": t.beneficiary.name if t.beneficiary else "Unknown",
            "beneficiary_code": t.beneficiary.beneficiary_code if t.beneficiary else "N/A",
            "ration_card_number": t.beneficiary.ration_card.card_number if t.beneficiary and t.beneficiary.ration_card else "N/A",
            "village_id": t.village_id,
            "village_name": t.beneficiary.village.name if t.beneficiary and t.beneficiary.village else "Unknown",
            "operator_name": t.operator_name,
            "total_amount": t.total_amount,
            "month_period": t.month_period,
            "verification_mode": t.verification_mode,
            "status": t.status,
            "created_at": t.created_at,
            "items": items_out
        })
    return results
