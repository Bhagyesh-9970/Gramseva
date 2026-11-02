import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav & General
    'project.title': 'Smart Water, Stronger Villages',
    'project.tagline': 'Smart Monitoring. Faster Maintenance. Reliable Water. Transparent Distribution.',
    'nav.home': 'Home',
    'nav.overview': 'Overview Dashboard',
    'nav.water': 'Water Monitoring',
    'nav.pumps': 'Pump & O&M',
    'nav.simulation': 'Hardware Simulation',
    'nav.maintenance': 'Digital O&M',
    'nav.pds': 'PDS Management',
    'nav.beneficiaries': 'Beneficiaries',
    'nav.distribution': 'Ration Distribution',
    'nav.stock': 'Stock Management',
    'nav.reconciliation': 'Stock Reconciliation',
    'nav.transactions': 'Transactions History',
    'nav.alerts': 'Alerts & Notifications',
    'nav.complaints': 'Citizen Complaints',
    'nav.reports': 'Reports & Analytics',
    'nav.guide': 'User Guide',
    'nav.admin': 'Administration',
    'nav.profile': 'Profile & Roles',
    'nav.login': 'Portal Login',
    'nav.logout': 'Sign Out',
    'village.select': 'Select Village / Gram Panchayat',
    'all.villages': 'All Villages (District View)',
    'mode.simulation': 'SIMULATION MODE',
    'mode.live': 'LIVE HARDWARE',

    // Hero & Home
    'hero.headline': 'Smarter Villages. Reliable Water. Transparent Ration Distribution.',
    'hero.sub': 'An integrated digital platform connecting rural water infrastructure, maintenance operations, and public distribution services through real-time monitoring and intelligent management.',
    'hero.explore_water': 'Explore Water Monitoring',
    'hero.explore_pds': 'Explore PDS Management',
    'hero.live_sim': 'View Live Simulation',
    'hero.stat.villages': 'Villages Monitored',
    'hero.stat.assets': 'Water Assets Connected',
    'hero.stat.beneficiaries': 'PDS Beneficiaries',
    'hero.stat.transactions': 'Distribution Transactions',
    'hero.stat.resolved': 'Maintenance Issues Resolved',

    // Water Module
    'water.overview': 'Rural Water Supply Infrastructure',
    'water.tanks_total': 'Total Water Tanks',
    'water.tanks_low': 'Low Water Tanks',
    'water.pumps_running': 'Pumps Currently Running',
    'water.critical_alerts': 'Active Critical Alerts',
    'water.sensor_uptime': 'Sensor Connectivity',
    'water.tank_capacity': 'Capacity',
    'water.current_level': 'Current Level',
    'water.status.normal': 'Normal',
    'water.status.medium': 'Medium',
    'water.status.low': 'Low',
    'water.status.critical': 'Critical',
    'water.pump_status': 'Pump Status',
    'water.current_amperes': 'Current Draw (Amperes)',
    'water.daily_runtime': 'Daily Runtime',
    'water.starts_today': 'Starts Today',
    'water.flow_rate': 'Flow Rate',
    'water.dry_run_warning': 'Dry-Run / Low Current Warning',

    // PDS Module
    'pds.overview': 'Public Distribution System (PDS)',
    'pds.registered_beneficiaries': 'Total Registered Beneficiaries',
    'pds.today_distribution': "Today's Distribution",
    'pds.monthly_distribution': 'Monthly Distributed Quantity',
    'pds.available_stock': 'Available Godown Stock',
    'pds.low_stock_commodities': 'Low Stock Commodities',
    'pds.ration_card': 'Ration Card Number',
    'pds.verify_card': 'Verify Ration Card',
    'pds.beneficiary_name': 'Beneficiary Name',
    'pds.category': 'Card Category',
    'pds.monthly_quota': 'Monthly Quota',
    'pds.consumed_quota': 'Consumed',
    'pds.remaining_quota': 'Remaining Quota',
    'pds.distribute_button': 'Confirm & Distribute Ration',
    'pds.receipt': 'Distribution Receipt Slip',
    'pds.reconciliation_title': 'Physical Stock Reconciliation',
    'pds.expected_stock': 'Expected Closing Stock',
    'pds.physical_stock': 'Physical Verified Stock',
    'pds.mismatch': 'Stock Mismatch',

    // Common
    'btn.save': 'Save Changes',
    'btn.cancel': 'Cancel',
    'btn.search': 'Search...',
    'btn.filter': 'Filter',
    'btn.export_csv': 'Export to CSV',
    'btn.print': 'Print Slip / Report',
    'btn.acknowledge': 'Acknowledge',
    'btn.resolve': 'Mark Resolved',
    'status.open': 'Open',
    'status.assigned': 'Assigned',
    'status.in_progress': 'In Progress',
    'status.completed': 'Completed',
    'status.overdue': 'Overdue',
  },
  mr: {
    // Nav & General
    'project.title': 'स्मार्ट पाणी, सक्षम गावे',
    'project.tagline': 'स्मार्ट देखरेख. जलद देखभाल. विश्वासार्ह पाणी. पारदर्शक वितरण.',
    'nav.home': 'मुख्यपृष्ठ',
    'nav.overview': 'एकूण आढावा',
    'nav.water': 'पाणीपुरवठा देखरेख',
    'nav.pumps': 'पंप व देखभाल (O&M)',
    'nav.simulation': 'हार्डवेअर सिम्युलेशन',
    'nav.maintenance': 'डिजिटल देखभाल (O&M)',
    'nav.pds': 'रेशन वितरण (PDS)',
    'nav.beneficiaries': 'लाभार्थी यादी',
    'nav.distribution': 'रेशन वाटप',
    'nav.stock': 'धान्य साठा व्यवस्थापन',
    'nav.reconciliation': 'साठा ताळमेळ',
    'nav.transactions': 'वितरण व्यवहार नोंद',
    'nav.alerts': 'सूचना व धोक्याचे इशारे',
    'nav.complaints': 'नागरी तक्रार निवारण',
    'nav.reports': 'अहवाल व आकडेवारी',
    'nav.guide': 'वापरकर्ता मार्गदर्शिका',
    'nav.admin': 'प्रशासकीय नियंत्रण',
    'nav.profile': 'माझे प्रोफाईल व परवानग्या',
    'nav.login': 'लॉगिन करा',
    'nav.logout': 'बाहेर पडा',
    'village.select': 'ग्रामपंचायत / गाव निवडा',
    'all.villages': 'सर्व गावे (जिल्हा स्तर)',
    'mode.simulation': 'सिम्युलेशन मोड',
    'mode.live': 'थेट हार्डवेअर मोड',

    // Hero & Home
    'hero.headline': 'स्मार्ट गावे. शाश्वत पाणीपुरवठा. पारदर्शक रेशन वितरण.',
    'hero.sub': 'ग्रामीण पाणीपुरवठा यंत्रणा, डिजिटल देखभाल व सार्वजनिक रेशन वितरण व्यवस्थेला जोडणारे एकात्मिक डिजिटल प्रशासन व्यासपीठ.',
    'hero.explore_water': 'पाणीपुरवठा व्यवस्था पहा',
    'hero.explore_pds': 'रेशन वितरण व्यवस्था पहा',
    'hero.live_sim': 'थेट सिम्युलेटर पहा',
    'hero.stat.villages': 'निरीक्षणाखालील गावे',
    'hero.stat.assets': 'जोडलेले पाणी साठे व पंप',
    'hero.stat.beneficiaries': 'नोंदणीकृत रेशन लाभार्थी',
    'hero.stat.transactions': 'एकूण वितरण व्यवहार',
    'hero.stat.resolved': 'निवारण झालेल्या तक्रारी',

    // Water Module
    'water.overview': 'ग्रामीण पाणीपुरवठा पायाभूत सुविधा',
    'water.tanks_total': 'एकूण पाण्याच्या टाक्या',
    'water.tanks_low': 'कमी पातळी असलेल्या टाक्या',
    'water.pumps_running': 'सुरू असलेले पंप',
    'water.critical_alerts': 'तातडीचे इशारे',
    'water.sensor_uptime': 'सेन्सर जोडणी प्रमाण',
    'water.tank_capacity': 'एकूण क्षमता',
    'water.current_level': 'सध्याची पाणी पातळी',
    'water.status.normal': 'सुरळीत / सामान्य',
    'water.status.medium': 'मध्यम पातळी',
    'water.status.low': 'कमी पातळी',
    'water.status.critical': 'अतिशय कमी (धोकादायक)',
    'water.pump_status': 'पंपाची स्थिती',
    'water.current_amperes': 'विद्युत प्रवाह (Amperes)',
    'water.daily_runtime': 'आजचा एकूण रनटाईम',
    'water.starts_today': 'आज किती वेळा सुरू झाला',
    'water.flow_rate': 'पाण्याचा प्रवाह (L/min)',
    'water.dry_run_warning': 'कोरडा चालण्याचा संभाव्य इशारा (Dry Run)',

    // PDS Module
    'pds.overview': 'सार्वजनिक वितरण प्रणाली (PDS)',
    'pds.registered_beneficiaries': 'नोंदणीकृत लाभार्थी',
    'pds.today_distribution': 'आजचे रेशन वाटप',
    'pds.monthly_distribution': 'चालू महिन्यातील एकूण वाटप',
    'pds.available_stock': 'गोदामातील उपलब्ध साठा',
    'pds.low_stock_commodities': 'कमी साठा असलेल्या वस्तू',
    'pds.ration_card': 'रेशन कार्ड क्रमांक',
    'pds.verify_card': 'रेशन कार्ड पडताळणी',
    'pds.beneficiary_name': 'लाभार्थ्याचे नाव',
    'pds.category': 'कार्ड प्रकार',
    'pds.monthly_quota': 'मासिक कोटा',
    'pds.consumed_quota': 'वाटप झालेला',
    'pds.remaining_quota': 'शिल्लक कोटा',
    'pds.distribute_button': 'रेशन वाटप निश्चित करा',
    'pds.receipt': 'वितरण पावती',
    'pds.reconciliation_title': 'प्रत्यक्ष साठा पडताळणी व ताळमेळ',
    'pds.expected_stock': 'अपेक्षित शिल्लक साठा',
    'pds.physical_stock': 'प्रत्यक्ष मोजलेला साठा',
    'pds.mismatch': 'साठ्यातील तफावत',

    // Common
    'btn.save': 'बदल जतन करा',
    'btn.cancel': 'रद्द करा',
    'btn.search': 'शोधा...',
    'btn.filter': 'फिल्टर',
    'btn.export_csv': 'CSV स्वरूपात जतन करा',
    'btn.print': 'पावती / अहवाल छापा',
    'btn.acknowledge': 'दखल घेतली',
    'btn.resolve': 'निवारण पूर्ण झाले',
    'status.open': 'प्रलंबित (Open)',
    'status.assigned': 'नेमणूक केली',
    'status.in_progress': 'काम सुरू आहे',
    'status.completed': 'पूर्ण झाले',
    'status.overdue': 'मुदत संपली',
  },
  hi: {
    // Nav & General
    'project.title': 'स्मार्ट जल, सशक्त गाँव',
    'project.tagline': 'स्मार्ट निगरानी. त्वरित रख-रखाव. विश्वसनीय जल. पारदर्शी वितरण.',
    'nav.home': 'होम',
    'nav.overview': 'अवलोकन डैशबोर्ड',
    'nav.water': 'जल आपूर्ति निगरानी',
    'nav.pumps': 'पंप एवं रख-रखाव',
    'nav.simulation': 'हार्डवेयर सिमुलेशन',
    'nav.maintenance': 'डिजिटल रख-रखाव (O&M)',
    'nav.pds': 'राशन वितरण (PDS)',
    'nav.beneficiaries': 'लाभार्थी सूची',
    'nav.distribution': 'राशन वितरण',
    'nav.stock': 'भंडार प्रबंधन',
    'nav.reconciliation': 'स्टॉक मिलान',
    'nav.transactions': 'लेन-देन इतिहास',
    'nav.alerts': 'सूचनाएं एवं अलर्ट',
    'nav.complaints': 'नागरिक शिकायतें',
    'nav.reports': 'रिपोर्ट्स एवं विश्लेषण',
    'nav.guide': 'उपयोगकर्ता मार्गदर्शिका',
    'nav.admin': 'प्रशासनिक पैनल',
    'nav.profile': 'प्रोफ़ाइल एवं अनुमतियाँ',
    'nav.login': 'लॉगिन करें',
    'nav.logout': 'लॉग आउट',
    'village.select': 'ग्राम पंचायत / गाँव चुनें',
    'all.villages': 'सभी गाँव (ज़िला स्तर)',
    'mode.simulation': 'सिमुलेशन मोड',
    'mode.live': 'लाइव हार्डवेयर मोड',

    // Hero & Home
    'hero.headline': 'स्मार्ट गाँव. विश्वसनीय जल. पारदर्शी राशन वितरण.',
    'hero.sub': 'ग्रामीण जल संरचना, रख-रखाव कार्य और सार्वजनिक राशन वितरण सेवाओं को वास्तविक समय निगरानी से जोड़ने वाला डिजिटल मंच।',
    'hero.explore_water': 'जल निगरानी देखें',
    'hero.explore_pds': 'राशन वितरण देखें',
    'hero.live_sim': 'लाइव सिमुलेटर देखें',
    'hero.stat.villages': 'निगरानी वाले गाँव',
    'hero.stat.assets': 'संबद्ध जल संपत्तियां',
    'hero.stat.beneficiaries': 'राशन लाभार्थी',
    'hero.stat.transactions': 'सफल वितरण लेन-देन',
    'hero.stat.resolved': 'समाधान हुई शिकायतें',

    // Water Module
    'water.overview': 'ग्रामीण जल आपूर्ति संरचना',
    'water.tanks_total': 'कुल पानी की टंकियां',
    'water.tanks_low': 'कम जल स्तर वाली टंकियां',
    'water.pumps_running': 'कार्यरत पंप',
    'water.critical_alerts': 'महत्वपूर्ण अलर्ट्स',
    'water.sensor_uptime': 'सेंसर कनेक्टिविटी',
    'water.tank_capacity': 'कुल क्षमता',
    'water.current_level': 'वर्तमान जल स्तर',
    'water.status.normal': 'सामान्य',
    'water.status.medium': 'मध्यम',
    'water.status.low': 'कम स्तर',
    'water.status.critical': 'अति गंभीर',
    'water.pump_status': 'पंप की स्थिति',
    'water.current_amperes': 'विद्युत धारा (Amperes)',
    'water.daily_runtime': 'आज का संचालन समय',
    'water.starts_today': 'शुरू होने की संख्या',
    'water.flow_rate': 'प्रवाह दर (L/min)',
    'water.dry_run_warning': 'ड्राई-रन चेतावनी',

    // PDS Module
    'pds.overview': 'सार्वजनिक वितरण प्रणाली (PDS)',
    'pds.registered_beneficiaries': 'कुल पंजीकृत लाभार्थी',
    'pds.today_distribution': 'आज का राशन वितरण',
    'pds.monthly_distribution': 'मासिक कुल वितरण',
    'pds.available_stock': 'गोदाम में उपलब्ध स्टॉक',
    'pds.low_stock_commodities': 'कम स्टॉक वाली वस्तुएं',
    'pds.ration_card': 'राशन कार्ड संख्या',
    'pds.verify_card': 'राशन कार्ड सत्यापन',
    'pds.beneficiary_name': 'लाभार्थी का नाम',
    'pds.category': 'कार्ड श्रेणी',
    'pds.monthly_quota': 'मासिक कोटा',
    'pds.consumed_quota': 'प्राप्त कोटा',
    'pds.remaining_quota': 'शेष कोटा',
    'pds.distribute_button': 'राशन वितरण पुष्टि करें',
    'pds.receipt': 'वितरण रसीद पर्ची',
    'pds.reconciliation_title': 'भौतिक स्टॉक सत्यापन एवं समाधान',
    'pds.expected_stock': 'अपेक्षित स्टॉक',
    'pds.physical_stock': 'सत्यापित भौतिक स्टॉक',
    'pds.mismatch': 'स्टॉक अंतर',

    // Common
    'btn.save': 'सुरक्षित करें',
    'btn.cancel': 'रद्द करें',
    'btn.search': 'खोजें...',
    'btn.filter': 'फ़िल्टर',
    'btn.export_csv': 'CSV निर्यात करें',
    'btn.print': 'रसीद / रिपोर्ट प्रिंट करें',
    'btn.acknowledge': 'स्वीकार करें',
    'btn.resolve': 'हल के रूप में चिह्नित करें',
    'status.open': 'लंबित (Open)',
    'status.assigned': 'नियुक्त किया गया',
    'status.in_progress': 'प्रगति पर',
    'status.completed': 'पूर्ण हुआ',
    'status.overdue': 'समय सीमा समाप्त',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('gp_language') as SupportedLanguage) || 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('gp_language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
