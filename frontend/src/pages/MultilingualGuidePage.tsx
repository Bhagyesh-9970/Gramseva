import React, { useState } from 'react';
import {
  BookOpen, Search, ChevronRight, ChevronLeft, Droplet,
  ShoppingBag, Cpu, Wrench, HelpCircle, CheckCircle2,
  Globe, Shield, Activity
} from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSidebar } from '../components/layout/AppSidebar';
import { useLanguage } from '../context/LanguageContext';

export const MultilingualGuidePage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [activeChapter, setActiveChapter] = useState(1);
  const [search, setSearch] = useState('');

  const chapters = [
    {
      id: 1,
      title: {
        en: '1. About the Platform',
        mr: '१. प्लॅटफॉर्मविषयी माहिती',
        hi: '१. मंच के बारे में'
      },
      content: {
        en: `### Platform Mission
The Smart Water & Digital Gram Panchayat Platform is an integrated rural governance system. It connects village drinking water infrastructure (tanks, pumps, flow sensors) and Public Distribution System (PDS) ration management under one centralized dashboard.

### Who Uses It?
- **Sarpanch & Gram Panchayat Admins**: Supervise community service delivery, oversee maintenance tasks, and review stock reports.
- **Water Works Operators**: Monitor tank storage in real-time, operate pump switches, and receive low-water alerts.
- **PDS Fair Price Shop Operators**: Rapidly verify ration cards, record food grain distribution, and reconcile physical warehouse stock.
- **District Authorities**: Compare village health indicators and intervene during critical water shortages or stock deficits.
- **Rural Citizens**: Check personal distribution history and submit grievance complaints.`,
        mr: `### उद्दिष्ट व स्वरूप
'स्मार्ट पाणी, सक्षम गावे' हे डिजिटल ग्रामपंचायत प्रशासन व्यासपीठ आहे. याद्वारे ग्रामीण पाणीपुरवठा (पाण्याच्या टाक्या, पंप, जलप्रवाह सेन्सर्स) आणि रास्त भाव धान्य वितरण (PDS) एकाच प्रणालीद्वारे जोडले गेले आहे.

### मुख्य वापरकर्ते:
- **सरपंच व ग्रामपंचायत अधिकारी**: गावातील पाणीपुरवठा व रेशन वाटपाचे थेट निरीक्षण करतात.
- **पाणीपुरवठा ऑपरेटर**: टाक्यांमधील पाणी पातळी, पंपाचा विद्युत प्रवाह आणि दुरुस्ती कामे सांभाळतात.
- **रास्त भाव रेशन दुकानदार**: रेशन कार्ड पडताळणी करून धान्य वाटप करतात व पावत्या देतात.
- **जिल्हा व तालुका अधिकारी**: संपूर्ण तालुक्यातील पाणी व धान्य साठ्यावर लक्ष ठेवतात.
- **ग्रामीण नागरिक**: स्वतःचे रेशन वाटप तपासू शकतात व तक्रारी नोंदवू शकतात.`,
        hi: `### मंच का उद्देश्य
'स्मार्ट जल, सशक्त गाँव' ग्रामीण भारत के लिए डिजिटल सार्वजनिक अवसंरचना मंच है। यह पेयजल संरचना (टंकियां, पंप) और सार्वजनिक राशन वितरण (PDS) को एकीकृत करता है।

### उपयोगकर्ता:
- **सरपंच व ग्राम पंचायत प्रशासन**: सेवा वितरण और रख-रखाव पर नज़र रखते हैं।
- **जल संचालक**: पानी की टंकियों और पंप मोटर का संचालन करते हैं।
- **राशन डीलर**: राशन कार्ड सत्यापन और पारदर्शी अनाज वितरण सुनिश्चित करते हैं।
- **नागरिक**: राशन स्थिति जाँचते हैं और शिकायतें दर्ज करते हैं।`
      }
    },
    {
      id: 2,
      title: {
        en: '2. Water Monitoring Guide',
        mr: '२. पाणीपुरवठा देखरेख मार्गदर्शक',
        hi: '२. जल आपूर्ति निगरानी'
      },
      content: {
        en: `### Understanding Tank Levels
Ultrasonic level sensors (JSN-SR04T) mounted on top of Elevated Storage Reservoirs (ESR) continuously bounce ultrasonic waves to calculate water depth:
- **Normal (>70%)**: Storage is sufficient for daily household supply.
- **Medium (30-70%)**: Standard operating range.
- **Low (10-30%)**: Triggers advisory warning; scheduled pumping required.
- **Critical (<10%)**: Emergency state; audible alert generated.

### Pump Current Draw (Amperes)
Non-invasive CT sensors monitor power draw:
- **Normal Current (10A - 16.5A)**: Motor running under proper hydraulic load.
- **Low Current (<6.5A)**: *Possible Dry-Run Warning* — Pump is spinning, but borewell water table is low or impeller is cavitating. Shut down pump to prevent motor winding burnout!`,
        mr: `### पाणी पातळी समजून घेणे:
टाक्यांवर बसवलेले अल्ट्रासॉनिक सेन्सर्स रिअल-टाइम पाणी पातळी मोजतात:
- **सामान्य (>७०%)**: मुबलक पाणी उपलब्ध.
- **मध्यम (३०-७०%)**: नियमित पातळी.
- **कमी (१०-३०%)**: पंप सुरू करण्याची वेळ.
- **गंभीर (<१०%)**: तातडीची धोक्याची सूचना.

### पंप करंट व ड्राय-रन इशारा:
- पंप सुरू असताना करंट जर ६.५ अँपिअरपेक्षा कमी झाला, तर विहिरीतील पाणी संपले असण्याची शक्यता असते (Dry Run). मोटर जळू नये म्हणून तात्काळ पंप बंद करा!`,
        hi: `### जल स्तर वर्गीकरण:
- **सामान्य (>70%)**: पर्याप्त जल स्तर।
- **मध्यम (30-70%)**: सामान्य स्थिति।
- **कम स्तर (10-30%)**: पंप चलाने की आवश्यकता।
- **अति गंभीर (<10%)**: तुरंत ध्यान देने योग्य।

### पंप करंट एवं ड्राई-रन सुरक्षा:
यदि पंप चालू होने पर करंट 6.5A से नीचे गिरता है, तो सिस्टम ड्राई-रन चेतावनी देता है ताकि मोटर को जलने से बचाया जा सके।`
      }
    },
    {
      id: 3,
      title: {
        en: '3. Digital O&M Workflow',
        mr: '३. डिजिटल देखभाल (O&M) कार्यपद्धती',
        hi: '३. डिजिटल रख-रखाव प्रक्रिया'
      },
      content: {
        en: `### Step-by-Step Maintenance Lifecycle:
1. **Trigger**: An automated sensor alert or citizen complaint is lodged.
2. **Task Creation**: Admin sets asset type, priority (Low, Medium, High, Critical), and description.
3. **Operator Assignment**: Assigned technician receives SMS/in-app work order.
4. **Field Inspection**: Operator inspects physical site, records observations, and updates status to *In Progress*.
5. **Closure**: Operator enters final resolution notes. System updates status to *Completed* and archives an immutable audit log.`,
        mr: `### देखभाल जीवनचक्र:
१. **इशारा**: सेन्सर अलार्म किंवा नागरी तक्रारीवरून समस्या समजते.
२. **कार्यनिर्मिती**: कामाचे स्वरूप आणि प्राधान्य (कमी, मध्यम, अतितातडीचे) ठरवले जाते.
३. **तंत्रज्ञ नेमणूक**: ऑपरेटरला काम सोपवले जाते.
४. **प्रत्यक्ष पाहणी**: ऑपरेटर जागेवर जाऊन दुरुस्ती करतो आणि ॲपमध्ये नोंद करतो.
५. **काम पूर्ण**: दुरुस्ती पूर्ण झाल्यावर काम बंद (Completed) केले जाते.`,
        hi: `### रख-रखाव कार्यप्रवाह:
1. सेंसर अलर्ट या नागरिक शिकायत।
2. कार्य आदेश (Work Order) तैयार करना।
3. ऑपरेटर/तकनीशियन की नियुक्ति।
4. स्थल निरीक्षण एवं मरम्मत।
5. कार्य समाप्ति एवं ऑडिट लॉग अद्यतन।`
      }
    },
    {
      id: 4,
      title: {
        en: '4. Public Distribution (PDS) Guide',
        mr: '४. रेशन वितरण (PDS) मार्गदर्शक',
        hi: '४. राशन वितरण मार्गदर्शिका'
      },
      content: {
        en: `### Ration Distribution Steps:
1. **Verification**: Enter the citizen's Ration Card Number (e.g. MH-27-010042) on the Distribution Desk.
2. **Eligibility Display**: System calculates family monthly entitlement minus already collected grain.
3. **Quantity Selection**: Enter distributed kg/litres up to remaining quota.
4. **Atomic Checkout**: Click *Confirm & Distribute*. Inventory is automatically decremented from warehouse stocks and cannot go negative.
5. **Print Receipt**: Provide the beneficiary with the printed transaction slip.

### Physical Stock Reconciliation:
- At the end of each distribution cycle, operators count physical gunny bags.
- Formula: *Expected Closing = Opening + Received - Distributed*.
- If physical bags differ from digital books, enter the difference with mandatory auditor justification!`,
        mr: `### रेशन वाटप प्रक्रिया:
१. **पडताळणी**: रेशन वाटप स्क्रीनवर रेशन कार्ड नंबर टाका.
२. **पात्रता तपासणी**: लाभार्थ्याचा मासिक कोटा आणि शिल्लक प्रमाण स्क्रीनवर दिसते.
३. **प्रमाण निवड**: जितके धान्य दिले तेवढे प्रमाण टाका.
४. **नोंद निश्चित करा**: बटण दाबताच गोदामातील साठा आपोआप कमी होतो.
५. **पावती छापा**: लाभार्थ्याला तात्काळ पावती द्या.

### प्रत्यक्ष साठा ताळमेळ:
- महिन्याअखेर गोदामातील पोती मोजून शिल्लक तपासा. फरक असल्यास कारण नमूद करणे बंधनकारक आहे.`,
        hi: `### राशन वितरण चरण:
1. वितरण डेस्क पर राशन कार्ड संख्या दर्ज करें।
2. शेष मासिक कोटा एवं पात्रता देखें।
3. दी जाने वाली मात्रा चुनें।
4. 'वितरण पुष्टि' करें - स्टॉक अपने आप कम हो जाएगा।
5. लाभार्थी को रसीद पर्ची प्रिंट करके दें।`
      }
    },
    {
      id: 5,
      title: {
        en: '5. Hardware Simulator Guide',
        mr: '५. हार्डवेअर सिम्युलेटर कसा वापरावा',
        hi: '५. हार्डवेयर सिमुलेटर उपयोग'
      },
      content: {
        en: `### Testing Scenarios Without Physical Hardware:
1. Navigate to **Hardware Simulation** in the sidebar.
2. Choose one of 6 pre-configured scenarios:
   - *Normal*: Stable operation.
   - *Tank Running Low*: Injects 18% water level, triggering alert.
   - *Pump Anomaly*: Drops current to 4.1A (dry-run).
   - *Pump Failure*: Simulates thermal trip.
   - *Leakage*: Spikes flow meter to 240 L/min.
3. Use manual sliders to dial custom water percentage or motor amperes.`,
        mr: `### सिम्युलेटरचा वापर:
१. डाव्या बाजूच्या मेनूमधील **हार्डवेअर सिम्युलेशन** निवडा.
२. ६ पूर्व-तयार परिस्थितींपैकी एक निवडा (उदा. कमी पाणी पातळी, पंप बिघाड किंवा गळती).
३. स्क्रीनवरील स्लाइडर फिरवून पाणी पातळी किंवा अँपिअर थेट बदलून पहा.`,
        hi: `### सिमुलेटर का उपयोग:
1. मेनू से 'हार्डवेयर सिमुलेशन' चुनें।
2. 6 परिदृश्यों में से किसी एक पर क्लिक करें (सामान्य, कम जल स्तर, पंप फॉल्ट, आदि)।
3. स्लाइडर द्वारा मैन्युअल रूप से सेंसर मान बदलें।`
      }
    },
    {
      id: 6,
      title: {
        en: '6. Troubleshooting & FAQs',
        mr: '६. समस्या निवारण व नेहमी विचारले जाणारे प्रश्न',
        hi: '६. समस्या निवारण एवं प्रश्नोत्तर'
      },
      content: {
        en: `### Frequently Asked Troubleshooting:
- **Sensor Shows Offline?** Check ESP32 power adapter and LoRa/Wi-Fi signal strength.
- **Pump Running but Water Not Rising?** Check for borehole drawdown or airlocks in suction pipeline.
- **Stock Mismatch Detected?** Inspect physical godown for rodent damage, moisture loss, or input GRN receipt errors.
- **Forgot Password?** Use the pre-configured demo account switcher on the Login page with default password \`password123\`.`,
        mr: `### नेहमीच्या समस्यांचे निवारण:
- **सेन्सर ऑफलाइन दिसत आहे?** ESP32 ची वीज जोडणी आणि इंटरनेट तपासा.
- **पंप सुरू आहे पण पाणी चढत नाही?** विहिरीतील पाण्याची पातळी किंवा सक्शन पाईप तपासा.
- **साठ्यात तफावत का आली?** पोत्यांची प्रत्यक्ष मोजणी पुन्हा करा आणि ओलावा घट तपासा.
- **पासवर्ड विसरलात?** लॉगिन स्क्रीनवरील डेमो खात्यांचा वापर करा (पासवर्ड: \`password123\`).`,
        hi: `### सामान्य प्रश्न एवं निवारण:
- **सेंसर डिस्कनेक्ट?** विद्युत आपूर्ति और नेटवर्क कनेक्शन जांचें।
- **स्टॉक अंतर?** गोदाम में बोरियों की पुनः गिनती करें।
- **डेमो लॉगिन पासवर्ड:** \`password123\`।`
      }
    }
  ];

  const currentCh = chapters.find(c => c.id === activeChapter) || chapters[0];
  const langKey = language as 'en' | 'mr' | 'hi';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Multilingual Digital User Guide
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Complete operational manual available in English, मराठी, and हिंदी.
              </p>
            </div>

            {/* Language Quick-Switch */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
              <Globe className="w-4 h-4 text-slate-400 ml-1" />
              {(['en', 'mr', 'hi'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    language === l
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'mr' ? 'मराठी' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          {/* Guide Stage with Chapter Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chapters Navigation */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Table of Contents
              </div>
              {chapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    activeChapter === ch.id
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold border-l-4 border-teal-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
                  }`}
                >
                  <span>{ch.title[langKey] || ch.title['en']}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            {/* Chapter Reading Pane */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Chapter {currentCh.id} of 6
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {currentCh.title[langKey] || currentCh.title['en']}
                </h2>
              </div>

              {/* Formatted Guide Prose */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                {(currentCh.content[langKey] || currentCh.content['en']).split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="font-bold text-sm sm:text-base text-slate-900 dark:text-white pt-2">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    const items = paragraph.split('\n- ');
                    return (
                      <ul key={idx} className="space-y-1.5 list-disc pl-5">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace(/^- /, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (/^\d+\.\s/.test(paragraph)) {
                    const items = paragraph.split(/\n\d+\.\s/);
                    return (
                      <ol key={idx} className="space-y-1.5 list-decimal pl-5">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace(/^\d+\.\s/, '')}</li>
                        ))}
                      </ol>
                    );
                  }
                  return <p key={idx}>{paragraph}</p>;
                })}
              </div>

              {/* Prev / Next Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  disabled={activeChapter === 1}
                  onClick={() => setActiveChapter(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Chapter</span>
                </button>

                <button
                  disabled={activeChapter === chapters.length}
                  onClick={() => setActiveChapter(prev => Math.min(chapters.length, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Next Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
