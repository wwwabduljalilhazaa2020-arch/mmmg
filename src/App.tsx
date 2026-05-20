import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Phone, MapPin, Calculator, FileText, CheckCircle2, ShieldCheck, 
  ChevronDown, ArrowLeft, ArrowRight, DollarSign, Briefcase, Car, Users, 
  Newspaper, HelpCircle, User, Lock, Send, Info, Award, Calendar, Eye
} from 'lucide-react';

// ==========================================
// 1. STATE MANAGEMENT (CONTEXT)
// ==========================================

interface AppState {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  calculatorData: {
    productType: string;
    itemPrice: number;
    downPayment: number;
    termMonths: number;
    salary: number;
    obligations: number;
  };
  setCalculatorData: React.Dispatch<React.SetStateAction<any>>;
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isSamaOpen: boolean;
  setIsSamaOpen: (open: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}

// ==========================================
// 2. MOCK DATA & FINANCIAL ARABIC DICTIONARY
// ==========================================

const PRODUCTS_DATA = {
  individuals: [
    { id: 'new-car', name: 'تمويل السيارات الجديدة', type: 'ind', desc: 'امتلك سيارة أحلامك الجديدة بأقساط ميسرة متوافقة مع الشريعة الإسلامية.', apr: '9.2%', flat: '4.8%', docs: 'الهوية الوطنية، تعريف بالراتب، كشف حساب 3 أشهر.' },
    { id: 'used-car', name: 'تمويل السيارات المستعملة', type: 'ind', desc: 'برامج تمويل مرنة تشمل طيفاً واسعاً من السيارات المستعملة المعتمدة.', apr: '10.5%', flat: '5.5%', docs: 'صورة الهوية، رخصة القيادة، عرض سعر المركبة.' },
    { id: 'cash-tawarruq', name: 'التمويل النقدي (التورق)', type: 'ind', desc: 'سيولة نقدية فورية تلبي احتياجاتك الشخصية والطارئة بهامش ربح تنافسي.', apr: '11.4%', flat: '5.9%', docs: 'إثبات ملاءة مالية، شهادة مدد وأجور (التأمينات).' },
    { id: 'real-estate', name: 'التمويل العقاري', type: 'ind', desc: 'حلول تمويل سكنية مبتكرة لشراء فيلا، شقة أو أرض لبناء منزلك الخاص.', apr: '6.8%', flat: '3.4%', docs: 'صك العقار، رخصة البناء، كشف حساب مفصل.' }
  ],
  business: [
    { id: 'fleet-finance', name: 'تمويل السيارات والأساطيل', type: 'biz', desc: 'تمويل وتوسيع أساطيل النقل والسيارات لمنشأتك لدعم العمليات التشغيلية.', apr: '8.5%', flat: '4.5%', docs: 'السجل التجاري، القوائم المالية، كشف حساب المنشأة.' },
    { id: 'heavy-equipment', name: 'تمويل المعدات الثقيلة', type: 'biz', desc: 'تمويل الآلات والمعدات الإنشائية والصناعية لزيادة الطاقة الإنتاجية.', apr: '9.0%', flat: '4.9%', docs: 'دراسة جدوى، السجل التجاري، عروض أسعار المعدات.' },
    { id: 'sme-cash', name: 'التمويل النقدي للمنشآت', type: 'biz', desc: 'تمويل رأس المال العامل لمساعدة المنشآت الصغيرة والمتوسطة على النمو والتوسع.', apr: '10.0%', flat: '5.2%', docs: 'عقد التأسيس، القوائم المالية المدققة لسنتين.' }
  ]
};

const NEWS_DATA = [
  { id: 1, title: "شراكة استراتيجية مع 'كريم' لتمويل الكباتن السعوديين بأقساط مرنة", date: "15 مايو 2026", desc: "أعلنت عبداللطيف جميل للتمويل عن إطلاق برنامج مخصص لدعم كباتن كريم لتمكينهم من امتلاك أحدث السيارات." },
  { id: 2, title: "الشركة تحصل على جائزة التميز في التمويل الرقمي لقطاع الأفراد", date: "30 أبريل 2026", desc: "تقديراً لجهودها المستمرة في أتمتة الإجراءات والتحول الرقمي الكامل للطلبات." },
  { id: 3, title: "عروض هيونداي الخاصة وحملات تمويل السيارات بدون دفعة أولى", date: "12 أبريل 2026", desc: "بالتعاون مع كبرى الوكالات، نطلق حملة التمويل الحصرية لعام 2026 بشروط ميسرة." }
];

const FAQS = [
  { q: "هل جميع الحلول التمويلية متوافقة مع الشريعة؟", a: "نعم، كافة منتجاتنا التمويلية من مرابحة وإيجار تمويلي معتمدة من اللجنة الشرعية للشركة ومصممة للتوافق مع أحكام الشريعة الإسلامية." },
  { q: "ما هو الحد الأقصى لنسبة استقطاع الراتب (DSR)؟", a: "بناءً على تعليمات البنك المركزي السعودي (ساما)، تبلغ النسبة القصوى للاستقطاع 45% من الراتب الشهري (أو 50% لشرائح الرواتب المرتفعة)." },
  { q: "ما هو الحد الأدنى للراتب للحصول على تمويل؟", a: "الحد الأدنى للراتب يبدأ من 3,000 ريال سعودي للقطاع الحكومي و 3,500 ريال سعودي للقطاع الخاص." }
];

const BRANCHES = [
  { city: "الرياض", name: "فرع الرياض الرئيسي - طريق الملك فهد", phone: "920002222", hours: "8:00 ص - 5:00 م", map: "https://maps.google.com" },
  { city: "جدة", name: "فرع جدة - طريق المدينة المنورة", phone: "920002223", hours: "8:00 ص - 5:00 م", map: "https://maps.google.com" },
  { city: "الدمام", name: "فرع المنطقة الشرقية - طريق الكباري", phone: "920002224", hours: "8:00 ص - 5:00 م", map: "https://maps.google.com" },
  { city: "أبها", name: "فرع عسير - طريق الملك فهد", phone: "920002225", hours: "8:00 ص - 5:00 م", map: "https://maps.google.com" }
];

// ==========================================
// 3. CORE PROVIDER & MAIN RENDER
// ==========================================

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState('new-car');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSamaOpen, setIsSamaOpen] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    productType: 'new-car',
    itemPrice: 100000,
    downPayment: 10000,
    termMonths: 60,
    salary: 8000,
    obligations: 500
  });

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      selectedProduct, setSelectedProduct,
      calculatorData, setCalculatorData,
      isLoginOpen, setIsLoginOpen,
      isSamaOpen, setIsSamaOpen
    }}>
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col justify-between selection:bg-[#8A1538] selection:text-white" dir="rtl">
        <Navbar />
        
        <main className="flex-grow pt-24 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {currentPage === 'home' && <Homepage />}
              {currentPage === 'products' && <ProductsPage />}
              {currentPage === 'calculator' && <CalculatorPage />}
              {currentPage === 'apply' && <ApplyFormPage />}
              {currentPage === 'about' && <AboutUsPage />}
              {currentPage === 'contact' && <ContactPage />}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
        <LoginModal />
        <SamaTermsModal />
      </div>
    </AppContext.Provider>
  );
}

// ==========================================
// 4. NAVIGATION & HEADER
// ==========================================

function Navbar() {
  const { setCurrentPage, setIsLoginOpen, currentPage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { id: 'individuals', label: 'تمويل الأفراد', sub: PRODUCTS_DATA.individuals },
    { id: 'business', label: 'تمويل الأعمال', sub: PRODUCTS_DATA.business },
    { id: 'about', label: 'من نحن', path: 'about' },
    { id: 'contact', label: 'اتصل بنا ومواقع الفروع', path: 'contact' }
  ];

  const handleNavClick = (id: string, path?: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (path) {
      setCurrentPage(path);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 transition-all border-b border-[#8A1538]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setCurrentPage('home')}>
            <svg className="h-10 w-auto text-[#8A1538]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="30" width="35" height="15" fill="currentColor" rx="2" />
              <rect x="55" y="30" width="35" height="15" fill="#C5A880" rx="2" />
              <rect x="10" y="55" width="80" height="15" fill="currentColor" rx="2" />
            </svg>
            <div className="mr-3 text-right">
              <span className="block font-bold text-lg leading-tight text-[#8A1538]">عبداللطيف جميل</span>
              <span className="block text-xs font-semibold text-gray-500 tracking-wider">للتمويل | FINANCE</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <div key={item.id} className="relative group"
                   onMouseEnter={() => item.sub && setActiveDropdown(item.id)}
                   onMouseLeave={() => setActiveDropdown(null)}>
                <button 
                  onClick={() => item.path && handleNavClick(item.id, item.path)}
                  className={`flex items-center gap-1 py-2 font-medium text-sm transition-colors hover:text-[#8A1538] ${
                    currentPage === item.path ? 'text-[#8A1538] font-bold' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                  {item.sub && <ChevronDown className="h-4 w-4" />}
                </button>

                {item.sub && activeDropdown === item.id && (
                  <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    {item.sub.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          const { setSelectedProduct } = useApp();
                          setSelectedProduct(subItem.id);
                          setCurrentPage('products');
                          setActiveDropdown(null);
                        }}
                        className="w-full text-right px-4 py-2 text-xs hover:bg-gray-50 text-gray-800 transition-colors flex items-center justify-between"
                      >
                        <span>{subItem.name}</span>
                        <ArrowLeft className="h-3 w-3 text-[#8A1538] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button 
              onClick={() => setCurrentPage('calculator')}
              className={`font-medium text-sm transition-colors hover:text-[#8A1538] ${currentPage === 'calculator' ? 'text-[#8A1538]' : 'text-gray-700'}`}
            >
              حاسبة التمويل
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#8A1538] px-3 py-2 rounded-md transition-colors"
            >
              <Lock className="h-4 w-4" />
              <span>بوابة العملاء</span>
            </button>
            <button 
              onClick={() => setCurrentPage('apply')}
              className="bg-[#8A1538] hover:bg-[#70102c] text-white px-5 py-2.5 rounded-md text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              تقديم طلب تمويل
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden gap-3">
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="p-2 text-gray-700 hover:text-[#8A1538]"
              aria-label="Login"
            >
              <Lock className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-inner"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <div key={item.id} className="border-b border-gray-50 pb-2">
                  <span className="block font-bold text-[#8A1538] mb-2">{item.label}</span>
                  {item.sub ? (
                    <div className="flex flex-col gap-2 pr-3">
                      {item.sub.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            const { setSelectedProduct } = useApp();
                            setSelectedProduct(subItem.id);
                            setCurrentPage('products');
                            setMobileMenuOpen(false);
                          }}
                          className="text-right text-sm text-gray-600 hover:text-[#8A1538]"
                        >
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => item.path && handleNavClick(item.id, item.path)}
                      className="text-right text-sm text-gray-600 hover:text-[#8A1538]"
                    >
                      دخول الصفحة
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => handleNavClick('calc', 'calculator')}
                className="text-right font-bold text-[#8A1538]"
              >
                حاسبة التمويل
              </button>
              <button 
                onClick={() => handleNavClick('apply', 'apply')}
                className="bg-[#8A1538] text-white text-center py-3 rounded-md font-bold mt-2"
              >
                تقديم طلب تمويل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ==========================================
// 5. PAGE 1: HOMEPAGE (الصفحة الرئيسية)
// ==========================================

function Homepage() {
  const { setCurrentPage, setSelectedProduct } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { title: "نصنع مستقبلك المالي بكل ثقة", subtitle: "برامج تمويل للسيارات والتورق تلبي طموحاتك وبأقساط مرنة متوافقة تماماً مع أحكام الشريعة" },
    { title: "انطلق بسيارتك الجديدة اليوم", subtitle: "برنامج التأجير التمويلي للسيارات بالتعاون مع كبرى الوكالات العالمية وبأفضل هوامش ربح" },
    { title: "سيولة نقدية فورية تصل لمليون ريال", subtitle: "عبر برنامج التمويل النقدي (التورق) للأفراد والمنشآت لمواجهة أي ظرف طارئ بنقرات بسيطة" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-20">
      
      {/* Dynamic Hero Carousel */}
      <section className="relative h-[550px] overflow-hidden bg-[#1A1A1A]">
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-black/30 z-10" />
        
        {slides.map((slide, idx) => (
          <AnimatePresence key={idx}>
            {idx === currentSlide && (
              <motion.div 
                className="absolute inset-0 flex flex-col justify-center px-4 sm:px-12 lg:px-24 z-20"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
              >
                <div className="max-w-3xl space-y-6">
                  <span className="inline-block bg-[#8A1538] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    عبداللطيف جميل للتمويل
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-gray-200 font-light">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => setCurrentPage('apply')}
                      className="bg-[#8A1538] hover:bg-[#70102c] text-white px-8 py-3.5 rounded-md font-bold text-sm shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      قدم الآن
                    </button>
                    <button 
                      onClick={() => setCurrentPage('calculator')}
                      className="bg-white/10 hover:bg-white/25 text-white border border-white/20 px-8 py-3.5 rounded-md font-bold text-sm backdrop-blur-sm transition-all"
                    >
                      حاسبة التمويل
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-[#8A1538]' : 'w-2.5 bg-white/50'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Quick Access Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">حلولنا التمويلية المبتكرة</h2>
          <p className="text-gray-500 mt-2">اختر المنتج الملائم لتطلعاتك وابدأ رحلة استقرارك المالي.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'تمويل السيارات', desc: 'سيارات جديدة ومستعملة بأقساط تمويلية متناغمة مع دخلك السنوي.', icon: Car, id: 'new-car' },
            { title: 'التمويل النقدي الشخصي', desc: 'سيولة نقدية سريعة وميسرة وفق مبادئ التورق الإسلامي.', icon: DollarSign, id: 'cash-tawarruq' },
            { title: 'تمويل الأعمال والشركات', desc: 'نهيئ لمنشأتك أسباب النمو ببرامج تمويلية مصممة لخطط التوسع المالي.', icon: Briefcase, id: 'fleet-finance' }
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 flex flex-col justify-between hover:shadow-xl transition-all hover:border-[#8A1538]/30 group">
              <div>
                <div className="h-12 w-12 bg-[#8A1538]/5 rounded-lg flex items-center justify-center text-[#8A1538] mb-6 group-hover:bg-[#8A1538] group-hover:text-white transition-all">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{card.desc}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedProduct(card.id);
                  setCurrentPage('products');
                }}
                className="flex items-center gap-2 text-sm font-bold text-[#8A1538] group-hover:gap-4 transition-all"
              >
                <span>استكشف المزيد</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Mini Calculator Widget */}
      <section className="bg-gradient-to-br from-[#8A1538] to-[#600f27] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="bg-[#C5A880] text-black text-xs font-bold px-3 py-1 rounded-full">حاسبة تفاعلية</span>
              <h2 className="text-3xl font-extrabold">احسب قسطك المالي بلحظات</h2>
              <p className="text-gray-200 font-light leading-relaxed">
                وفرنا لك أداة دقيقة تحسب لك القسط الشهري المتوقع والالتزامات بشكل ميسر ومتوافق تمامًا مع أنظمة البنك المركزي السعودي (ساما).
              </p>
              <div className="flex items-center gap-4 bg-black/20 p-4 rounded-lg border border-white/10 text-xs">
                <Info className="h-5 w-5 text-[#C5A880] shrink-0" />
                <span>النتائج مبنية على هامش ربح تقديري 5.5% سنويًا ومعدل نسبة سنوي (APR) تقريبي يبلغ 9.9%.</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <MiniCalculator />
            </div>

          </div>
        </div>
      </section>

      {/* Latest Media News Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold">المركز الإعلامي</h2>
            <p className="text-gray-500 text-sm mt-1">تابع آخر أخبار عبداللطيف جميل للتمويل وإنجازاتها المستمرة.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {NEWS_DATA.map((news) => (
            <article key={news.id} className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between p-6">
              <div className="space-y-4">
                <span className="text-xs text-[#8A1538] font-bold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {news.date}
                </span>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{news.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-light">{news.desc}</p>
              </div>
              <div className="border-t border-gray-50 pt-4 mt-6">
                <button className="text-xs font-bold text-[#8A1538] flex items-center gap-1.5 hover:underline">
                  قراءة الخبر بالكامل
                  <ArrowLeft className="h-3 w-3" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Section Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <HelpCircle className="h-10 w-10 text-[#8A1538] mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900">الأسئلة الشائعة والوعي المالي</h2>
          <p className="text-gray-500 text-sm mt-1">كل ما يهمك معرفته عن سياساتنا التمويلية وحقوقك كعميل.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <FAQAccordionItem key={idx} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

    </div>
  );
}

function MiniCalculator() {
  const { calculatorData, setCalculatorData, setCurrentPage } = useApp();

  const handleSliderChange = (key: string, val: number) => {
    setCalculatorData((prev: any) => ({ ...prev, [key]: val }));
  };

  const itemPrice = calculatorData.itemPrice;
  const downPayment = calculatorData.downPayment;
  const term = calculatorData.termMonths;
  const salary = calculatorData.salary;
  const obligations = calculatorData.obligations;

  // Real SAMA logic
  const flatRate = 0.055; 
  const principal = itemPrice - downPayment;
  const profit = principal * flatRate * (term / 12);
  const totalDue = principal + profit;
  const monthlyInstallment = Math.round(totalDue / term);
  const dsrPercent = Math.round(((monthlyInstallment + obligations) / salary) * 100);
  const isDsrOverLimit = dsrPercent > 45;

  return (
    <div className="bg-white text-gray-900 rounded-xl p-8 shadow-xl border border-gray-100">
      <div className="space-y-6">
        
        {/* Sliders */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>سعر السلعة / السيارة</span>
            <span className="text-[#8A1538] font-bold">{itemPrice.toLocaleString()} ريال</span>
          </div>
          <input 
            type="range" min="30000" max="300000" step="5000"
            value={itemPrice} onChange={(e) => handleSliderChange('itemPrice', Number(e.target.value))}
            className="w-full accent-[#8A1538] cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>الدفعة الأولى</span>
            <span className="text-[#8A1538] font-bold">{downPayment.toLocaleString()} ريال</span>
          </div>
          <input 
            type="range" min="0" max={itemPrice * 0.5} step="1000"
            value={downPayment} onChange={(e) => handleSliderChange('downPayment', Number(e.target.value))}
            className="w-full accent-[#8A1538] cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-semibold">
            <span>مدة التمويل بالشهور</span>
            <span className="text-[#8A1538] font-bold">{term} شهر</span>
          </div>
          <input 
            type="range" min="12" max="60" step="12"
            value={term} onChange={(e) => handleSliderChange('termMonths', Number(e.target.value))}
            className="w-full accent-[#8A1538] cursor-pointer"
          />
        </div>

        {/* Dynamic SAMA Alert */}
        {isDsrOverLimit && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-lg border border-red-100 text-xs flex gap-2 items-center">
            <Info className="h-4.5 w-4.5 shrink-0" />
            <span>تنبيّه: قيمة القسط تتجاوز النسبة المسموح بها من البنك المركزي (ساما). يرجى خفض قيمة التمويل أو زيادة المدة.</span>
          </div>
        )}

        {/* Results Block */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mt-4 text-center">
          <div>
            <span className="block text-xs text-gray-500 font-medium">القسط الشهري المتوقع</span>
            <span className="text-xl sm:text-2xl font-black text-[#8A1538]">{monthlyInstallment.toLocaleString()} ر.س</span>
          </div>
          <div>
            <span className="block text-xs text-gray-500 font-medium">نسبة عبء الدين (DSR)</span>
            <span className={`text-xl sm:text-2xl font-black ${isDsrOverLimit ? 'text-red-600' : 'text-green-600'}`}>
              {dsrPercent}%
            </span>
          </div>
        </div>

        <button 
          onClick={() => setCurrentPage('calculator')}
          className="w-full bg-[#8A1538] hover:bg-[#70102c] text-white py-3.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>تعديل الحسبة والتفاصيل الشاملة</span>
          <ArrowLeft className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}

function FAQAccordionItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-right p-5 flex justify-between items-center hover:bg-gray-50/50"
      >
        <span className="font-bold text-gray-800 text-base">{question}</span>
        <ChevronDown className={`h-5 w-5 text-[#8A1538] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-50"
          >
            <p className="p-5 text-gray-600 text-sm leading-relaxed font-light">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 6. PAGE 2: PRODUCT DETAIL PAGE (صفحات المنتجات)
// ==========================================

function ProductsPage() {
  const { selectedProduct, setSelectedProduct, setCurrentPage } = useApp();
  
  const allProducts = [...PRODUCTS_DATA.individuals, ...PRODUCTS_DATA.business];
  const activeProd = allProducts.find(p => p.id === selectedProduct) || allProducts[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 pb-0 justify-start sm:justify-center">
        {allProducts.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProduct(p.id)}
            className={`px-5 py-3.5 font-bold text-xs sm:text-sm whitespace-nowrap border-b-2 transition-all shrink-0 ${
              selectedProduct === p.id 
                ? 'border-[#8A1538] text-[#8A1538]' 
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Product Highlight Grid */}
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Banner Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#8A1538] to-[#5a0c23] text-white p-10 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-[#C5A880] text-black text-xs font-bold px-4 py-1.5 rounded-br-2xl">
            {activeProd.type === 'ind' ? 'أفراد' : 'أعمال'}
          </div>
          <h1 className="text-3xl font-extrabold">{activeProd.name}</h1>
          <p className="text-gray-100 font-light text-base leading-relaxed">{activeProd.desc}</p>
          
          <div className="border-t border-white/20 pt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-200 text-sm">هامش الربح التقديري (Flat)</span>
              <span className="font-bold text-[#C5A880]">{activeProd.flat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-200 text-sm">معدل النسبة السنوي (APR)</span>
              <span className="font-bold text-[#C5A880]">{activeProd.apr}</span>
            </div>
          </div>

          <button 
            onClick={() => setCurrentPage('apply')}
            className="w-full bg-[#C5A880] hover:bg-[#b09367] text-black py-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>قدم طلبك الآن</span>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Benefits & SAMA Documents */}
        <div className="lg:col-span-7 space-y-8">
          
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="h-6 w-6 text-[#8A1538]" />
              مزايا البرنامج التمويلي
            </h3>
            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                "موافق للجنة الرقابة الشرعية بكل تفاصيله.",
                "لا يتطلب وجود كفيل غارم لمعظم الشرائح والرواتب.",
                "فترة سداد مرنة تمتد لـ 60 شهراً كأقصى حد.",
                "حلول نقل وتأمين متكاملة وحفظ للحقوق."
              ].map((benefit, i) => (
                <li key={i} className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#F8F9FA] p-6 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#8A1538]" />
              المستندات المطلوبة (إشراف ساما)
            </h3>
            <p className="text-sm text-gray-500 mb-4">وفقاً لمبادئ التمويل المسؤول ولتأكيد أهليتك المالية، يجب تزويدنا بالتالي:</p>
            <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-2">
              <span className="text-xs font-bold text-gray-400 block">المستندات الأساسية:</span>
              <p className="text-sm font-semibold text-gray-700">{activeProd.docs}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// 7. PAGE 3: ADVANCED CALCULATOR (الحاسبة الشاملة)
// ==========================================

function CalculatorPage() {
  const { calculatorData, setCalculatorData, setCurrentPage } = useApp();

  const handleSliderChange = (key: string, val: number) => {
    setCalculatorData((prev: any) => ({ ...prev, [key]: val }));
  };

  const { productType, itemPrice, downPayment, termMonths, salary, obligations } = calculatorData;

  // Real formula matching Saudi banks standard (Flat Rate + DSR)
  const flatRate = 0.055; 
  const principal = itemPrice - downPayment;
  const profit = principal * flatRate * (termMonths / 12);
  const totalDue = principal + profit;
  const monthlyInstallment = Math.round(totalDue / termMonths);
  const dsrPercent = Math.round(((monthlyInstallment + obligations) / salary) * 100);
  const isDsrOverLimit = dsrPercent > 45;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900">حاسبة التمويل المتقدمة</h1>
        <p className="text-gray-500 text-sm">حدد منتجك وسقف دخلك المالي لنعطيك تفاصيل ميزانيتك المعتمدة فوراً.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Sliders Container */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">نوع المنتج التمويلي</label>
            <select 
              value={productType}
              onChange={(e) => handleSliderChange('productType', e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538] focus:ring-1 focus:ring-[#8A1538]"
            >
              <option value="new-car">تمويل السيارات الجديدة</option>
              <option value="used-car">تمويل السيارات المستعملة</option>
              <option value="cash-tawarruq">التمويل النقدي (التورق)</option>
              <option value="real-estate">التمويل العقاري</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-700">سعر السلعة / قيمة التمويل</span>
              <span className="text-[#8A1538] font-bold">{itemPrice.toLocaleString()} ر.س</span>
            </div>
            <input 
              type="range" min="20000" max="400000" step="5000"
              value={itemPrice} onChange={(e) => handleSliderChange('itemPrice', Number(e.target.value))}
              className="w-full accent-[#8A1538]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-700">الدفعة الأولى (إن وجدت)</span>
              <span className="text-[#8A1538] font-bold">{downPayment.toLocaleString()} ر.س</span>
            </div>
            <input 
              type="range" min="0" max={itemPrice * 0.5} step="1000"
              value={downPayment} onChange={(e) => handleSliderChange('downPayment', Number(e.target.value))}
              className="w-full accent-[#8A1538]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-700">مدة التمويل (بالأشهر)</span>
              <span className="text-[#8A1538] font-bold">{termMonths} شهراً</span>
            </div>
            <input 
              type="range" min="12" max="60" step="12"
              value={termMonths} onChange={(e) => handleSliderChange('termMonths', Number(e.target.value))}
              className="w-full accent-[#8A1538]"
            />
          </div>

          <hr className="border-gray-100" />

          {/* SAMA Strict Inputs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">الراتب الشهري الفعلي (ر.س)</label>
              <input 
                type="number" min="3000" max="100000"
                value={salary} onChange={(e) => handleSliderChange('salary', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">الالتزامات الشهرية الأخرى (ر.s)</label>
              <input 
                type="number" min="0" max="50000"
                value={obligations} onChange={(e) => handleSliderChange('obligations', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]"
              />
            </div>
          </div>

        </div>

        {/* Output Box */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] text-white p-8 rounded-2xl shadow-lg space-y-6">
          <div className="text-center pb-4 border-b border-white/10">
            <span className="text-xs text-[#C5A880] block font-bold mb-1">القسط المتوقع والمستحقات</span>
            <span className="text-3xl font-black text-white">{monthlyInstallment.toLocaleString()} <span className="text-xs font-light">ر.س / شهر</span></span>
          </div>

          <div className="space-y-4 text-sm font-light">
            <div className="flex justify-between">
              <span className="text-gray-300">معدل النسبة السنوي التقريبي (APR)</span>
              <span className="font-bold text-[#C5A880]">9.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">نسبة الربح الثابتة (Flat)</span>
              <span className="font-bold">5.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">إجمالي مبلغ التمويل (الأصل)</span>
              <span className="font-bold">{principal.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">إجمالي الأرباح المستحقة</span>
              <span className="font-bold text-[#C5A880]">{Math.round(profit).toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4">
              <span className="text-gray-300">إجمالي مبلغ السداد الشامل</span>
              <span className="font-bold text-white text-lg">{Math.round(totalDue).toLocaleString()} ر.س</span>
            </div>
          </div>

          {/* SAMA Warnings */}
          {isDsrOverLimit ? (
            <div className="bg-red-500/10 text-red-300 p-4 rounded-lg border border-red-500/20 text-xs leading-relaxed">
              خطأ: قيمة القسط مع التزاماتك الإضافية تتخطى 45% من راتبك. يرجى خفض قيمة السيارة أو تمديد المدة ليتلاءم مع معايير "ساما".
            </div>
          ) : (
            <div className="bg-green-500/10 text-green-300 p-4 rounded-lg border border-green-500/20 text-xs flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>الحسبة متطابقة مع ضوابط التمويل المسؤول (ساما).</span>
            </div>
          )}

          <button 
            disabled={isDsrOverLimit}
            onClick={() => setCurrentPage('apply')}
            className={`w-full py-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              isDsrOverLimit 
                ? 'bg-gray-600 cursor-not-allowed text-gray-300' 
                : 'bg-[#8A1538] hover:bg-[#70102c] text-white hover:shadow-lg'
            }`}
          >
            <span>قدم طلبك بالاعتماد على الحسبة</span>
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// 8. PAGE 4: MULTI-STEP APPLICATION FORM
// ==========================================

function ApplyFormPage() {
  const { calculatorData } = useApp();
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    mobile: '',
    city: 'الرياض',
    employer: '',
    salary: calculatorData.salary.toString(),
    obligations: calculatorData.obligations.toString(),
    productType: calculatorData.productType,
    financeAmount: (calculatorData.itemPrice - calculatorData.downPayment).toString()
  });

  const [errors, setErrors] = useState<any>({});

  const validateStep = () => {
    let errs: any = {};
    if (step === 1) {
      if (!formData.fullName.trim()) errs.fullName = "الاسم بالكامل مطلوب";
      if (!/^\d{10}$/.test(formData.nationalId)) errs.nationalId = "رقم الهوية الوطنية/الإقامة يجب أن يتكون من 10 أرقام";
      if (!/^(05)\d{8}$/.test(formData.mobile)) errs.mobile = "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    } else if (step === 2) {
      if (!formData.employer.trim()) errs.employer = "جهة العمل مطلوبة";
      if (Number(formData.salary) < 3000) errs.salary = "الحد الأدنى للراتب للحصول على الأهلية هو 3,000 ر.س";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      // Mock unique app tracking code
      const randId = 'ALJ-' + Math.floor(100000 + Math.random() * 900000);
      setTrackingId(randId);
      setShowSuccess(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      
      {/* Step Progress bar */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= num ? 'bg-[#8A1538] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {num}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${step >= num ? 'text-[#8A1538]' : 'text-gray-400'}`}>
              {num === 1 && "البيانات الشخصية"}
              {num === 2 && "المهنية والمالية"}
              {num === 3 && "تفاصيل التمويل"}
              {num === 4 && "تأكيد وإرسال"}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="text-lg font-bold border-r-4 border-[#8A1538] pr-2.5 mb-4">الخطوة الأولى: البيانات الشخصية</h3>
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">الاسم الثلاثي (كما هو ببطاقة الهوية)</label>
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]" 
                placeholder="محمد عبدالله الشهري"
              />
              {errors.fullName && <span className="text-xs text-red-500 font-semibold">{errors.fullName}</span>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">رقم الهوية الوطنية / الإقامة</label>
                <input 
                  type="text" 
                  value={formData.nationalId} 
                  onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]" 
                  placeholder="10XXXXXXXX"
                />
                {errors.nationalId && <span className="text-xs text-red-500 font-semibold">{errors.nationalId}</span>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">رقم الجوال النشط</label>
                <input 
                  type="text" 
                  value={formData.mobile} 
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]" 
                  placeholder="05XXXXXXXX"
                />
                {errors.mobile && <span className="text-xs text-red-500 font-semibold">{errors.mobile}</span>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">المدينة</label>
              <select 
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]"
              >
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام</option>
                <option value="أبها">أبها</option>
              </select>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="text-lg font-bold border-r-4 border-[#8A1538] pr-2.5 mb-4">الخطوة الثانية: المهنية والمالية</h3>
            
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">جهة العمل الحالية</label>
              <input 
                type="text" 
                value={formData.employer} 
                onChange={(e) => setFormData({...formData, employer: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]" 
                placeholder="أرامكو، وزارة الدفاع، إلخ..."
              />
              {errors.employer && <span className="text-xs text-red-500 font-semibold">{errors.employer}</span>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">الراتب الأساسي + البدلات (ر.س)</label>
                <input 
                  type="number" 
                  value={formData.salary} 
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]" 
                />
                {errors.salary && <span className="text-xs text-red-500 font-semibold">{errors.salary}</span>}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">الالتزامات الشهرية الحالية (ر.س)</label>
                <input 
                  type="number" 
                  value={formData.obligations} 
                  onChange={(e) => setFormData({...formData, obligations: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#8A1538]" 
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
