import { MarketTick, MarketSummary, Universe } from '../types/market';

export interface CatalogItem {
  symbol: string;
  ticker: string;
  name: string;
  sector: string;
  defaultAvgVolume: number;
  basePrice: number;
}

// Comprehensive Catalog of EXACTLY 200 Indian Equities with valid FYERS V3 tickers
export const FALLBACK_CATALOG: CatalogItem[] = [
  { symbol: "NSE:INFY-EQ", ticker: "INFY", name: "Infosys Ltd", sector: "IT", defaultAvgVolume: 8433014, basePrice: 1890.5 },
  { symbol: "NSE:TCS-EQ", ticker: "TCS", name: "Tata Consultancy Services", sector: "IT", defaultAvgVolume: 2854080, basePrice: 4210.0 },
  { symbol: "NSE:HCLTECH-EQ", ticker: "HCLTECH", name: "HCL Technologies", sector: "IT", defaultAvgVolume: 2154149, basePrice: 1780.25 },
  { symbol: "NSE:WIPRO-EQ", ticker: "WIPRO", name: "Wipro Ltd", sector: "IT", defaultAvgVolume: 9407361, basePrice: 530.1 },
  { symbol: "NSE:TECHM-EQ", ticker: "TECHM", name: "Tech Mahindra", sector: "IT", defaultAvgVolume: 2004274, basePrice: 1620.4 },
  { symbol: "NSE:LTIM-EQ", ticker: "LTIM", name: "LTIMindtree Ltd", sector: "IT", defaultAvgVolume: 650000, basePrice: 5950.0 },
  { symbol: "NSE:PERSISTENT-EQ", ticker: "PERSISTENT", name: "Persistent Systems", sector: "IT", defaultAvgVolume: 459812, basePrice: 5240.0 },
  { symbol: "NSE:COFORGE-EQ", ticker: "COFORGE", name: "Coforge Ltd", sector: "IT", defaultAvgVolume: 2391632, basePrice: 7680.0 },
  { symbol: "NSE:MPHASIS-EQ", ticker: "MPHASIS", name: "Mphasis Ltd", sector: "IT", defaultAvgVolume: 416207, basePrice: 2980.0 },
  { symbol: "NSE:KPITTECH-EQ", ticker: "KPITTECH", name: "KPIT Technologies", sector: "IT", defaultAvgVolume: 1498729, basePrice: 1580.0 },
  { symbol: "NSE:TATAELXSI-EQ", ticker: "TATAELXSI", name: "Tata Elxsi Ltd", sector: "IT", defaultAvgVolume: 194507, basePrice: 7450.0 },
  { symbol: "NSE:OFSS-EQ", ticker: "OFSS", name: "Oracle Financial Services", sector: "IT", defaultAvgVolume: 219626, basePrice: 10200.0 },
  { symbol: "NSE:CYIENT-EQ", ticker: "CYIENT", name: "Cyient Ltd", sector: "IT", defaultAvgVolume: 1271980, basePrice: 1920.0 },
  { symbol: "NSE:ROUTE-EQ", ticker: "ROUTE", name: "Route Mobile Ltd", sector: "IT", defaultAvgVolume: 236182, basePrice: 1680.0 },
  { symbol: "NSE:MASTEK-EQ", ticker: "MASTEK", name: "Mastek Ltd", sector: "IT", defaultAvgVolume: 319635, basePrice: 2480.0 },
  { symbol: "NSE:BSOFT-EQ", ticker: "BSOFT", name: "Birlasoft Ltd", sector: "IT", defaultAvgVolume: 1387413, basePrice: 620.0 },
  { symbol: "NSE:SONATSOFTW-EQ", ticker: "SONATSOFTW", name: "Sonata Software", sector: "IT", defaultAvgVolume: 1160766, basePrice: 680.0 },
  { symbol: "NSE:ZENSARTECH-EQ", ticker: "ZENSARTECH", name: "Zensar Technologies", sector: "IT", defaultAvgVolume: 2423371, basePrice: 740.0 },
  { symbol: "NSE:HDFCBANK-EQ", ticker: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking", defaultAvgVolume: 28192170, basePrice: 1645.8 },
  { symbol: "NSE:ICICIBANK-EQ", ticker: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Banking", defaultAvgVolume: 8606334, basePrice: 1230.4 },
  { symbol: "NSE:SBIN-EQ", ticker: "SBIN", name: "State Bank of India", sector: "Banking", defaultAvgVolume: 7584694, basePrice: 815.6 },
  { symbol: "NSE:KOTAKBANK-EQ", ticker: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", defaultAvgVolume: 11352383, basePrice: 1820.0 },
  { symbol: "NSE:AXISBANK-EQ", ticker: "AXISBANK", name: "Axis Bank Ltd", sector: "Banking", defaultAvgVolume: 4612753, basePrice: 1195.5 },
  { symbol: "NSE:INDUSINDBK-EQ", ticker: "INDUSINDBK", name: "IndusInd Bank", sector: "Banking", defaultAvgVolume: 1531161, basePrice: 1450.2 },
  { symbol: "NSE:BANKBARODA-EQ", ticker: "BANKBARODA", name: "Bank of Baroda", sector: "Banking", defaultAvgVolume: 7503783, basePrice: 248.3 },
  { symbol: "NSE:PNB-EQ", ticker: "PNB", name: "Punjab National Bank", sector: "Banking", defaultAvgVolume: 13539987, basePrice: 112.5 },
  { symbol: "NSE:CANBK-EQ", ticker: "CANBK", name: "Canara Bank", sector: "Banking", defaultAvgVolume: 12044884, basePrice: 105.8 },
  { symbol: "NSE:FEDERALBNK-EQ", ticker: "FEDERALBNK", name: "Federal Bank", sector: "Banking", defaultAvgVolume: 5000328, basePrice: 192.4 },
  { symbol: "NSE:IDFCFIRSTB-EQ", ticker: "IDFCFIRSTB", name: "IDFC First Bank", sector: "Banking", defaultAvgVolume: 16560324, basePrice: 74.5 },
  { symbol: "NSE:RBLBANK-EQ", ticker: "RBLBANK", name: "RBL Bank Ltd", sector: "Banking", defaultAvgVolume: 3192749, basePrice: 220.0 },
  { symbol: "NSE:BANKINDIA-EQ", ticker: "BANKINDIA", name: "Bank of India", sector: "Banking", defaultAvgVolume: 5292009, basePrice: 145.0 },
  { symbol: "NSE:UNIONBANK-EQ", ticker: "UNIONBANK", name: "Union Bank of India", sector: "Banking", defaultAvgVolume: 8919461, basePrice: 118.0 },
  { symbol: "NSE:AUBANK-EQ", ticker: "AUBANK", name: "AU Small Finance Bank", sector: "Banking", defaultAvgVolume: 1319748, basePrice: 680.0 },
  { symbol: "NSE:BANDHANBNK-EQ", ticker: "BANDHANBNK", name: "Bandhan Bank Ltd", sector: "Banking", defaultAvgVolume: 9658766, basePrice: 198.0 },
  { symbol: "NSE:BAJFINANCE-EQ", ticker: "BAJFINANCE", name: "Bajaj Finance Ltd", sector: "Financial Services", defaultAvgVolume: 5013468, basePrice: 7250.0 },
  { symbol: "NSE:BAJAJFINSV-EQ", ticker: "BAJAJFINSV", name: "Bajaj Finserv Ltd", sector: "Financial Services", defaultAvgVolume: 631827, basePrice: 1860.0 },
  { symbol: "NSE:HDFCLIFE-EQ", ticker: "HDFCLIFE", name: "HDFC Life Insurance", sector: "Financial Services", defaultAvgVolume: 3249593, basePrice: 715.0 },
  { symbol: "NSE:SBILIFE-EQ", ticker: "SBILIFE", name: "SBI Life Insurance", sector: "Financial Services", defaultAvgVolume: 879620, basePrice: 1780.0 },
  { symbol: "NSE:CHOLAFIN-EQ", ticker: "CHOLAFIN", name: "Cholamandalam Investment", sector: "Financial Services", defaultAvgVolume: 1074840, basePrice: 1540.0 },
  { symbol: "NSE:MUTHOOTFIN-EQ", ticker: "MUTHOOTFIN", name: "Muthoot Finance", sector: "Financial Services", defaultAvgVolume: 850920, basePrice: 1950.0 },
  { symbol: "NSE:SHRIRAMFIN-EQ", ticker: "SHRIRAMFIN", name: "Shriram Finance", sector: "Financial Services", defaultAvgVolume: 3727843, basePrice: 3150.0 },
  { symbol: "NSE:ICICIGI-EQ", ticker: "ICICIGI", name: "ICICI Lombard General Ins", sector: "Financial Services", defaultAvgVolume: 845378, basePrice: 1920.0 },
  { symbol: "NSE:SBICARD-EQ", ticker: "SBICARD", name: "SBI Cards & Payment", sector: "Financial Services", defaultAvgVolume: 2783912, basePrice: 710.0 },
  { symbol: "NSE:LICHSGFIN-EQ", ticker: "LICHSGFIN", name: "LIC Housing Finance", sector: "Financial Services", defaultAvgVolume: 3515374, basePrice: 680.0 },
  { symbol: "NSE:PNBHOUSING-EQ", ticker: "PNBHOUSING", name: "PNB Housing Finance", sector: "Financial Services", defaultAvgVolume: 883970, basePrice: 880.0 },
  { symbol: "NSE:MANAPPURAM-EQ", ticker: "MANAPPURAM", name: "Manappuram Finance", sector: "Financial Services", defaultAvgVolume: 5651521, basePrice: 220.0 },
  { symbol: "NSE:POONAWALLA-EQ", ticker: "POONAWALLA", name: "Poonawalla Fincorp", sector: "Financial Services", defaultAvgVolume: 1190883, basePrice: 390.0 },
  { symbol: "NSE:CREDITACC-EQ", ticker: "CREDITACC", name: "CreditAccess Grameen", sector: "Financial Services", defaultAvgVolume: 224839, basePrice: 1180.0 },
  { symbol: "NSE:M&MFIN-EQ", ticker: "M&MFIN", name: "Mahindra Financial Services", sector: "Financial Services", defaultAvgVolume: 1896096, basePrice: 290.0 },
  { symbol: "NSE:RELIANCE-EQ", ticker: "RELIANCE", name: "Reliance Industries", sector: "Energy", defaultAvgVolume: 10570845, basePrice: 2980.5 },
  { symbol: "NSE:NTPC-EQ", ticker: "NTPC", name: "NTPC Ltd", sector: "Energy", defaultAvgVolume: 8104784, basePrice: 395.4 },
  { symbol: "NSE:POWERGRID-EQ", ticker: "POWERGRID", name: "Power Grid Corp", sector: "Energy", defaultAvgVolume: 8664923, basePrice: 335.2 },
  { symbol: "NSE:ONGC-EQ", ticker: "ONGC", name: "Oil & Natural Gas Corp", sector: "Energy", defaultAvgVolume: 11466660, basePrice: 295.8 },
  { symbol: "NSE:BPCL-EQ", ticker: "BPCL", name: "Bharat Petroleum", sector: "Energy", defaultAvgVolume: 5001736, basePrice: 355.0 },
  { symbol: "NSE:IOC-EQ", ticker: "IOC", name: "Indian Oil Corp", sector: "Energy", defaultAvgVolume: 8035637, basePrice: 172.5 },
  { symbol: "NSE:COALINDIA-EQ", ticker: "COALINDIA", name: "Coal India Ltd", sector: "Energy", defaultAvgVolume: 9629879, basePrice: 490.6 },
  { symbol: "NSE:ADANIGREEN-EQ", ticker: "ADANIGREEN", name: "Adani Green Energy", sector: "Energy", defaultAvgVolume: 1435478, basePrice: 1840.0 },
  { symbol: "NSE:TATAPOWER-EQ", ticker: "TATAPOWER", name: "Tata Power Company", sector: "Energy", defaultAvgVolume: 4737108, basePrice: 435.0 },
  { symbol: "NSE:GAIL-EQ", ticker: "GAIL", name: "GAIL India Ltd", sector: "Energy", defaultAvgVolume: 6527941, basePrice: 225.0 },
  { symbol: "NSE:NHPC-EQ", ticker: "NHPC", name: "NHPC Ltd", sector: "Energy", defaultAvgVolume: 9307310, basePrice: 98.0 },
  { symbol: "NSE:SJVN-EQ", ticker: "SJVN", name: "SJVN Ltd", sector: "Energy", defaultAvgVolume: 1868297, basePrice: 110.0 },
  { symbol: "NSE:TORNTPOWER-EQ", ticker: "TORNTPOWER", name: "Torrent Power Ltd", sector: "Energy", defaultAvgVolume: 377076, basePrice: 1480.0 },
  { symbol: "NSE:OIL-EQ", ticker: "OIL", name: "Oil India Ltd", sector: "Energy", defaultAvgVolume: 2590309, basePrice: 580.0 },
  { symbol: "NSE:IGL-EQ", ticker: "IGL", name: "Indraprastha Gas Ltd", sector: "Energy", defaultAvgVolume: 2194828, basePrice: 410.0 },
  { symbol: "NSE:TATAMOTORS-EQ", ticker: "TATAMOTORS", name: "Tata Motors Ltd", sector: "Automobile", defaultAvgVolume: 13000000, basePrice: 985.0 },
  { symbol: "NSE:MARUTI-EQ", ticker: "MARUTI", name: "Maruti Suzuki India", sector: "Automobile", defaultAvgVolume: 342157, basePrice: 12450.0 },
  { symbol: "NSE:M&M-EQ", ticker: "M&M", name: "Mahindra & Mahindra", sector: "Automobile", defaultAvgVolume: 1812230, basePrice: 2840.0 },
  { symbol: "NSE:BAJAJ-AUTO-EQ", ticker: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", sector: "Automobile", defaultAvgVolume: 216262, basePrice: 11200.0 },
  { symbol: "NSE:EICHERMOT-EQ", ticker: "EICHERMOT", name: "Eicher Motors Ltd", sector: "Automobile", defaultAvgVolume: 391393, basePrice: 4850.0 },
  { symbol: "NSE:HEROMOTOCO-EQ", ticker: "HEROMOTOCO", name: "Hero MotoCorp", sector: "Automobile", defaultAvgVolume: 553616, basePrice: 5420.0 },
  { symbol: "NSE:TVSMOTOR-EQ", ticker: "TVSMOTOR", name: "TVS Motor Company", sector: "Automobile", defaultAvgVolume: 808817, basePrice: 2680.0 },
  { symbol: "NSE:ASHOKLEY-EQ", ticker: "ASHOKLEY", name: "Ashok Leyland", sector: "Automobile", defaultAvgVolume: 14065336, basePrice: 242.0 },
  { symbol: "NSE:BHARATFORG-EQ", ticker: "BHARATFORG", name: "Bharat Forge", sector: "Automobile", defaultAvgVolume: 1057941, basePrice: 1560.0 },
  { symbol: "NSE:MOTHERSON-EQ", ticker: "MOTHERSON", name: "Samvardhana Motherson", sector: "Automobile", defaultAvgVolume: 11154726, basePrice: 175.0 },
  { symbol: "NSE:BALKRISIND-EQ", ticker: "BALKRISIND", name: "Balkrishna Industries", sector: "Automobile", defaultAvgVolume: 574136, basePrice: 2870.0 },
  { symbol: "NSE:EXIDEIND-EQ", ticker: "EXIDEIND", name: "Exide Industries", sector: "Automobile", defaultAvgVolume: 2336434, basePrice: 425.0 },
  { symbol: "NSE:APOLLOTYRE-EQ", ticker: "APOLLOTYRE", name: "Apollo Tyres Ltd", sector: "Automobile", defaultAvgVolume: 845848, basePrice: 510.0 },
  { symbol: "NSE:BOSCHLTD-EQ", ticker: "BOSCHLTD", name: "Bosch Ltd", sector: "Automobile", defaultAvgVolume: 40260, basePrice: 34200.0 },
  { symbol: "NSE:SONACOMS-EQ", ticker: "SONACOMS", name: "Sona BLW Precision", sector: "Automobile", defaultAvgVolume: 1852006, basePrice: 680.0 },
  { symbol: "NSE:SUNPHARMA-EQ", ticker: "SUNPHARMA", name: "Sun Pharma Industries", sector: "Pharma", defaultAvgVolume: 1538216, basePrice: 1820.0 },
  { symbol: "NSE:DRREDDY-EQ", ticker: "DRREDDY", name: "Dr Reddy's Labs", sector: "Pharma", defaultAvgVolume: 1550971, basePrice: 6620.0 },
  { symbol: "NSE:CIPLA-EQ", ticker: "CIPLA", name: "Cipla Ltd", sector: "Pharma", defaultAvgVolume: 807387, basePrice: 1640.0 },
  { symbol: "NSE:DIVISLAB-EQ", ticker: "DIVISLAB", name: "Divi's Laboratories", sector: "Pharma", defaultAvgVolume: 464262, basePrice: 5350.0 },
  { symbol: "NSE:LUPIN-EQ", ticker: "LUPIN", name: "Lupin Ltd", sector: "Pharma", defaultAvgVolume: 739806, basePrice: 2150.0 },
  { symbol: "NSE:AUROPHARMA-EQ", ticker: "AUROPHARMA", name: "Aurobindo Pharma", sector: "Pharma", defaultAvgVolume: 800025, basePrice: 1480.0 },
  { symbol: "NSE:TORNTPHARM-EQ", ticker: "TORNTPHARM", name: "Torrent Pharma", sector: "Pharma", defaultAvgVolume: 318636, basePrice: 3320.0 },
  { symbol: "NSE:ALKEM-EQ", ticker: "ALKEM", name: "Alkem Laboratories", sector: "Pharma", defaultAvgVolume: 152071, basePrice: 5900.0 },
  { symbol: "NSE:MANKIND-EQ", ticker: "MANKIND", name: "Mankind Pharma Ltd", sector: "Pharma", defaultAvgVolume: 397672, basePrice: 2850.0 },
  { symbol: "NSE:NATCOPHARM-EQ", ticker: "NATCOPHARM", name: "Natco Pharma Ltd", sector: "Pharma", defaultAvgVolume: 499428, basePrice: 1550.0 },
  { symbol: "NSE:GLENMARK-EQ", ticker: "GLENMARK", name: "Glenmark Pharma", sector: "Pharma", defaultAvgVolume: 486395, basePrice: 1280.0 },
  { symbol: "NSE:BIOCON-EQ", ticker: "BIOCON", name: "Biocon Ltd", sector: "Pharma", defaultAvgVolume: 3114622, basePrice: 350.0 },
  { symbol: "NSE:ZYDUSLIFE-EQ", ticker: "ZYDUSLIFE", name: "Zydus Lifesciences", sector: "Pharma", defaultAvgVolume: 1613234, basePrice: 1140.0 },
  { symbol: "NSE:APOLLOHOSP-EQ", ticker: "APOLLOHOSP", name: "Apollo Hospitals", sector: "Healthcare", defaultAvgVolume: 360727, basePrice: 7150.0 },
  { symbol: "NSE:MAXHEALTH-EQ", ticker: "MAXHEALTH", name: "Max Healthcare", sector: "Healthcare", defaultAvgVolume: 1991988, basePrice: 940.0 },
  { symbol: "NSE:FORTIS-EQ", ticker: "FORTIS", name: "Fortis Healthcare", sector: "Healthcare", defaultAvgVolume: 1189140, basePrice: 680.0 },
  { symbol: "NSE:ITC-EQ", ticker: "ITC", name: "ITC Ltd", sector: "FMCG", defaultAvgVolume: 13209452, basePrice: 505.0 },
  { symbol: "NSE:HINDUNILVR-EQ", ticker: "HINDUNILVR", name: "Hindustan Unilever", sector: "FMCG", defaultAvgVolume: 1205415, basePrice: 2820.0 },
  { symbol: "NSE:NESTLEIND-EQ", ticker: "NESTLEIND", name: "Nestle India Ltd", sector: "FMCG", defaultAvgVolume: 1424439, basePrice: 2540.0 },
  { symbol: "NSE:BRITANNIA-EQ", ticker: "BRITANNIA", name: "Britannia Industries", sector: "FMCG", defaultAvgVolume: 263981, basePrice: 5980.0 },
  { symbol: "NSE:TATACONSUM-EQ", ticker: "TATACONSUM", name: "Tata Consumer Products", sector: "FMCG", defaultAvgVolume: 1203700, basePrice: 1180.0 },
  { symbol: "NSE:DABUR-EQ", ticker: "DABUR", name: "Dabur India Ltd", sector: "FMCG", defaultAvgVolume: 1938500, basePrice: 640.0 },
  { symbol: "NSE:MARICO-EQ", ticker: "MARICO", name: "Marico Ltd", sector: "FMCG", defaultAvgVolume: 1620234, basePrice: 655.0 },
  { symbol: "NSE:COLPAL-EQ", ticker: "COLPAL", name: "Colgate-Palmolive", sector: "FMCG", defaultAvgVolume: 417602, basePrice: 3480.0 },
  { symbol: "NSE:GODREJCP-EQ", ticker: "GODREJCP", name: "Godrej Consumer Products", sector: "FMCG", defaultAvgVolume: 2277058, basePrice: 1350.0 },
  { symbol: "NSE:PGHH-EQ", ticker: "PGHH", name: "P&G Hygiene & Health", sector: "FMCG", defaultAvgVolume: 15462, basePrice: 18500.0 },
  { symbol: "NSE:EMAMILTD-EQ", ticker: "EMAMILTD", name: "Emami Ltd", sector: "FMCG", defaultAvgVolume: 1887528, basePrice: 685.0 },
  { symbol: "NSE:VBL-EQ", ticker: "VBL", name: "Varun Beverages Ltd", sector: "FMCG", defaultAvgVolume: 6043003, basePrice: 520.0 },
  { symbol: "NSE:RADICO-EQ", ticker: "RADICO", name: "Radico Khaitan Ltd", sector: "FMCG", defaultAvgVolume: 261421, basePrice: 1680.0 },
  { symbol: "NSE:TATASTEEL-EQ", ticker: "TATASTEEL", name: "Tata Steel Ltd", sector: "Metals", defaultAvgVolume: 27706220, basePrice: 154.5 },
  { symbol: "NSE:JSWSTEEL-EQ", ticker: "JSWSTEEL", name: "JSW Steel Ltd", sector: "Metals", defaultAvgVolume: 1549306, basePrice: 995.0 },
  { symbol: "NSE:HINDALCO-EQ", ticker: "HINDALCO", name: "Hindalco Industries", sector: "Metals", defaultAvgVolume: 3584594, basePrice: 715.0 },
  { symbol: "NSE:VEDL-EQ", ticker: "VEDL", name: "Vedanta Ltd", sector: "Metals", defaultAvgVolume: 10142039, basePrice: 465.0 },
  { symbol: "NSE:JINDALSTEL-EQ", ticker: "JINDALSTEL", name: "Jindal Steel & Power", sector: "Metals", defaultAvgVolume: 753974, basePrice: 1025.0 },
  { symbol: "NSE:NMDC-EQ", ticker: "NMDC", name: "NMDC Ltd", sector: "Metals", defaultAvgVolume: 15597010, basePrice: 225.0 },
  { symbol: "NSE:SAIL-EQ", ticker: "SAIL", name: "Steel Authority of India", sector: "Metals", defaultAvgVolume: 21683732, basePrice: 132.0 },
  { symbol: "NSE:NATIONALUM-EQ", ticker: "NATIONALUM", name: "National Aluminium Co", sector: "Metals", defaultAvgVolume: 6522159, basePrice: 215.0 },
  { symbol: "NSE:HINDCOPPER-EQ", ticker: "HINDCOPPER", name: "Hindustan Copper Ltd", sector: "Metals", defaultAvgVolume: 14062691, basePrice: 325.0 },
  { symbol: "NSE:APLAPOLLO-EQ", ticker: "APLAPOLLO", name: "APL Apollo Tubes", sector: "Metals", defaultAvgVolume: 653437, basePrice: 1680.0 },
  { symbol: "NSE:RATNAMANI-EQ", ticker: "RATNAMANI", name: "Ratnamani Metals & Tubes", sector: "Metals", defaultAvgVolume: 118262, basePrice: 3680.0 },
  { symbol: "NSE:BHARTIARTL-EQ", ticker: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "Telecom", defaultAvgVolume: 6459363, basePrice: 1580.0 },
  { symbol: "NSE:IDEA-EQ", ticker: "IDEA", name: "Vodafone Idea", sector: "Telecom", defaultAvgVolume: 486236559, basePrice: 11.2 },
  { symbol: "NSE:INDUSTOWER-EQ", ticker: "INDUSTOWER", name: "Indus Towers", sector: "Telecom", defaultAvgVolume: 4826134, basePrice: 395.0 },
  { symbol: "NSE:TATACOMM-EQ", ticker: "TATACOMM", name: "Tata Communications", sector: "Telecom", defaultAvgVolume: 263219, basePrice: 1820.0 },
  { symbol: "NSE:PVRINOX-EQ", ticker: "PVRINOX", name: "PVR INOX Ltd", sector: "Telecom", defaultAvgVolume: 635163, basePrice: 1520.0 },
  { symbol: "NSE:LT-EQ", ticker: "LT", name: "Larsen & Toubro", sector: "Industrials", defaultAvgVolume: 1386036, basePrice: 3680.0 },
  { symbol: "NSE:ADANIPORTS-EQ", ticker: "ADANIPORTS", name: "Adani Ports & SEZ", sector: "Industrials", defaultAvgVolume: 2224769, basePrice: 1475.0 },
  { symbol: "NSE:ADANIENT-EQ", ticker: "ADANIENT", name: "Adani Enterprises", sector: "Industrials", defaultAvgVolume: 1779170, basePrice: 2980.0 },
  { symbol: "NSE:SIEMENS-EQ", ticker: "SIEMENS", name: "Siemens Ltd", sector: "Industrials", defaultAvgVolume: 367850, basePrice: 6850.0 },
  { symbol: "NSE:ABB-EQ", ticker: "ABB", name: "ABB India Ltd", sector: "Industrials", defaultAvgVolume: 171369, basePrice: 8120.0 },
  { symbol: "NSE:CUMMINSIND-EQ", ticker: "CUMMINSIND", name: "Cummins India Ltd", sector: "Industrials", defaultAvgVolume: 420428, basePrice: 3650.0 },
  { symbol: "NSE:THERMAX-EQ", ticker: "THERMAX", name: "Thermax Ltd", sector: "Industrials", defaultAvgVolume: 145508, basePrice: 4980.0 },
  { symbol: "NSE:SCHAEFFLER-EQ", ticker: "SCHAEFFLER", name: "Schaeffler India Ltd", sector: "Industrials", defaultAvgVolume: 60941, basePrice: 4350.0 },
  { symbol: "NSE:VOLTAS-EQ", ticker: "VOLTAS", name: "Voltas Ltd", sector: "Industrials", defaultAvgVolume: 926279, basePrice: 1680.0 },
  { symbol: "NSE:WHIRLPOOL-EQ", ticker: "WHIRLPOOL", name: "Whirlpool of India", sector: "Industrials", defaultAvgVolume: 790281, basePrice: 1540.0 },
  { symbol: "NSE:HAVELLS-EQ", ticker: "HAVELLS", name: "Havells India Ltd", sector: "Industrials", defaultAvgVolume: 785126, basePrice: 1820.0 },
  { symbol: "NSE:HONAUT-EQ", ticker: "HONAUT", name: "Honeywell Automation India", sector: "Industrials", defaultAvgVolume: 3273, basePrice: 49500.0 },
  { symbol: "NSE:KEI-EQ", ticker: "KEI", name: "KEI Industries Ltd", sector: "Industrials", defaultAvgVolume: 545235, basePrice: 4520.0 },
  { symbol: "NSE:BEL-EQ", ticker: "BEL", name: "Bharat Electronics", sector: "Defence", defaultAvgVolume: 9908320, basePrice: 295.0 },
  { symbol: "NSE:HAL-EQ", ticker: "HAL", name: "Hindustan Aeronautics", sector: "Defence", defaultAvgVolume: 921849, basePrice: 4720.0 },
  { symbol: "NSE:COCHINSHIP-EQ", ticker: "COCHINSHIP", name: "Cochin Shipyard Ltd", sector: "Defence", defaultAvgVolume: 1090049, basePrice: 1950.0 },
  { symbol: "NSE:MAZDOCK-EQ", ticker: "MAZDOCK", name: "Mazagon Dock Shipbuilders", sector: "Defence", defaultAvgVolume: 701191, basePrice: 4850.0 },
  { symbol: "NSE:BEML-EQ", ticker: "BEML", name: "BEML Ltd", sector: "Defence", defaultAvgVolume: 459895, basePrice: 4180.0 },
  { symbol: "NSE:GRSE-EQ", ticker: "GRSE", name: "Garden Reach Shipbuilders", sector: "Defence", defaultAvgVolume: 401354, basePrice: 2380.0 },
  { symbol: "NSE:BHEL-EQ", ticker: "BHEL", name: "Bharat Heavy Electricals", sector: "Capital Goods", defaultAvgVolume: 7364608, basePrice: 248.0 },
  { symbol: "NSE:TIINDIA-EQ", ticker: "TIINDIA", name: "Tube Investments of India", sector: "Capital Goods", defaultAvgVolume: 361783, basePrice: 3980.0 },
  { symbol: "NSE:GRINDWELL-EQ", ticker: "GRINDWELL", name: "Grindwell Norton Ltd", sector: "Capital Goods", defaultAvgVolume: 26715, basePrice: 2380.0 },
  { symbol: "NSE:ELGIEQUIP-EQ", ticker: "ELGIEQUIP", name: "Elgi Equipments Ltd", sector: "Capital Goods", defaultAvgVolume: 711179, basePrice: 750.0 },
  { symbol: "NSE:KAYNES-EQ", ticker: "KAYNES", name: "Kaynes Technology India", sector: "Capital Goods", defaultAvgVolume: 1134995, basePrice: 4950.0 },
  { symbol: "NSE:DIXON-EQ", ticker: "DIXON", name: "Dixon Technologies India", sector: "Capital Goods", defaultAvgVolume: 358810, basePrice: 14800.0 },
  { symbol: "NSE:POLYCAB-EQ", ticker: "POLYCAB", name: "Polycab India Ltd", sector: "Capital Goods", defaultAvgVolume: 355036, basePrice: 6800.0 },
  { symbol: "NSE:IRFC-EQ", ticker: "IRFC", name: "Indian Railway Finance Corp", sector: "Infra", defaultAvgVolume: 7175998, basePrice: 195.0 },
  { symbol: "NSE:RVNL-EQ", ticker: "RVNL", name: "Rail Vikas Nigam Ltd", sector: "Infra", defaultAvgVolume: 4521658, basePrice: 450.0 },
  { symbol: "NSE:PFC-EQ", ticker: "PFC", name: "Power Finance Corp", sector: "Infra", defaultAvgVolume: 8784637, basePrice: 470.0 },
  { symbol: "NSE:RECLTD-EQ", ticker: "RECLTD", name: "REC Ltd", sector: "Infra", defaultAvgVolume: 5434190, basePrice: 510.0 },
  { symbol: "NSE:IRCON-EQ", ticker: "IRCON", name: "IRCON International Ltd", sector: "Infra", defaultAvgVolume: 1475418, basePrice: 285.0 },
  { symbol: "NSE:NLCINDIA-EQ", ticker: "NLCINDIA", name: "NLC India Ltd", sector: "Infra", defaultAvgVolume: 1581443, basePrice: 242.0 },
  { symbol: "NSE:HFCL-EQ", ticker: "HFCL", name: "HFCL Ltd", sector: "Infra", defaultAvgVolume: 12000000, basePrice: 88.0 },
  { symbol: "NSE:RAILTEL-EQ", ticker: "RAILTEL", name: "RailTel Corp of India", sector: "Infra", defaultAvgVolume: 929466, basePrice: 480.0 },
  { symbol: "NSE:RITES-EQ", ticker: "RITES", name: "RITES Ltd", sector: "Infra", defaultAvgVolume: 324543, basePrice: 360.0 },
  { symbol: "NSE:NBCC-EQ", ticker: "NBCC", name: "NBCC India Ltd", sector: "Infra", defaultAvgVolume: 5290068, basePrice: 115.0 },
  { symbol: "NSE:GMRINFRA-EQ", ticker: "GMRINFRA", name: "GMR Airports Infra", sector: "Infra", defaultAvgVolume: 14000000, basePrice: 94.0 },
  { symbol: "NSE:CONCOR-EQ", ticker: "CONCOR", name: "Container Corp of India", sector: "Infra", defaultAvgVolume: 1378498, basePrice: 890.0 },
  { symbol: "NSE:PIDILITIND-EQ", ticker: "PIDILITIND", name: "Pidilite Industries", sector: "Chemicals", defaultAvgVolume: 694606, basePrice: 3080.0 },
  { symbol: "NSE:DEEPAKNTR-EQ", ticker: "DEEPAKNTR", name: "Deepak Nitrite Ltd", sector: "Chemicals", defaultAvgVolume: 322122, basePrice: 2480.0 },
  { symbol: "NSE:NAVINFLUOR-EQ", ticker: "NAVINFLUOR", name: "Navin Fluorine Intl", sector: "Chemicals", defaultAvgVolume: 137482, basePrice: 3650.0 },
  { symbol: "NSE:SUDARSCHEM-EQ", ticker: "SUDARSCHEM", name: "Sudarshan Chemical Ind", sector: "Chemicals", defaultAvgVolume: 537936, basePrice: 1020.0 },
  { symbol: "NSE:FINPIPE-EQ", ticker: "FINPIPE", name: "Finolex Industries", sector: "Chemicals", defaultAvgVolume: 431419, basePrice: 225.0 },
  { symbol: "NSE:ASTRAL-EQ", ticker: "ASTRAL", name: "Astral Ltd", sector: "Chemicals", defaultAvgVolume: 1297231, basePrice: 2280.0 },
  { symbol: "NSE:TATACHEM-EQ", ticker: "TATACHEM", name: "Tata Chemicals Ltd", sector: "Chemicals", defaultAvgVolume: 2448238, basePrice: 1120.0 },
  { symbol: "NSE:BALRAMCHIN-EQ", ticker: "BALRAMCHIN", name: "Balrampur Chini Mills", sector: "Chemicals", defaultAvgVolume: 5328880, basePrice: 558.0 },
  { symbol: "NSE:GSFC-EQ", ticker: "GSFC", name: "Gujarat State Fert & Chem", sector: "Chemicals", defaultAvgVolume: 1127234, basePrice: 195.0 },
  { symbol: "NSE:CHAMBLFERT-EQ", ticker: "CHAMBLFERT", name: "Chambal Fertilisers", sector: "Chemicals", defaultAvgVolume: 535023, basePrice: 480.0 },
  { symbol: "NSE:COROMANDEL-EQ", ticker: "COROMANDEL", name: "Coromandel International", sector: "Chemicals", defaultAvgVolume: 123486, basePrice: 1720.0 },
  { symbol: "NSE:PIIND-EQ", ticker: "PIIND", name: "PI Industries Ltd", sector: "Chemicals", defaultAvgVolume: 328530, basePrice: 4480.0 },
  { symbol: "NSE:SRF-EQ", ticker: "SRF", name: "SRF Ltd", sector: "Chemicals", defaultAvgVolume: 232949, basePrice: 2380.0 },
  { symbol: "NSE:DLF-EQ", ticker: "DLF", name: "DLF Ltd", sector: "Real Estate", defaultAvgVolume: 3351674, basePrice: 895.0 },
  { symbol: "NSE:GODREJPROP-EQ", ticker: "GODREJPROP", name: "Godrej Properties", sector: "Real Estate", defaultAvgVolume: 642760, basePrice: 2980.0 },
  { symbol: "NSE:OBEROIRLTY-EQ", ticker: "OBEROIRLTY", name: "Oberoi Realty Ltd", sector: "Real Estate", defaultAvgVolume: 517706, basePrice: 1980.0 },
  { symbol: "NSE:PRESTIGE-EQ", ticker: "PRESTIGE", name: "Prestige Estates Projects", sector: "Real Estate", defaultAvgVolume: 499910, basePrice: 1680.0 },
  { symbol: "NSE:LODHA-EQ", ticker: "LODHA", name: "Macrotech Developers (Lodha)", sector: "Real Estate", defaultAvgVolume: 1506878, basePrice: 1350.0 },
  { symbol: "NSE:SOBHA-EQ", ticker: "SOBHA", name: "Sobha Ltd", sector: "Real Estate", defaultAvgVolume: 86131, basePrice: 1680.0 },
  { symbol: "NSE:BRIGADE-EQ", ticker: "BRIGADE", name: "Brigade Enterprises Ltd", sector: "Real Estate", defaultAvgVolume: 668850, basePrice: 1120.0 },
  { symbol: "NSE:PHOENIXLTD-EQ", ticker: "PHOENIXLTD", name: "The Phoenix Mills Ltd", sector: "Real Estate", defaultAvgVolume: 390785, basePrice: 1780.0 },
  { symbol: "NSE:SIGNATURE-EQ", ticker: "SIGNATURE", name: "Signatureglobal India", sector: "Real Estate", defaultAvgVolume: 219190, basePrice: 1420.0 },
  { symbol: "NSE:SUNTECK-EQ", ticker: "SUNTECK", name: "Sunteck Realty Ltd", sector: "Real Estate", defaultAvgVolume: 141557, basePrice: 540.0 },
  { symbol: "NSE:TITAN-EQ", ticker: "TITAN", name: "Titan Company Ltd", sector: "Consumer", defaultAvgVolume: 608985, basePrice: 3720.0 },
  { symbol: "NSE:TRENT-EQ", ticker: "TRENT", name: "Trent Ltd", sector: "Consumer", defaultAvgVolume: 671162, basePrice: 7240.0 },
  { symbol: "NSE:ASIANPAINT-EQ", ticker: "ASIANPAINT", name: "Asian Paints Ltd", sector: "Consumer", defaultAvgVolume: 573231, basePrice: 3210.0 },
  { symbol: "NSE:BERGEPAINT-EQ", ticker: "BERGEPAINT", name: "Berger Paints", sector: "Consumer", defaultAvgVolume: 410258, basePrice: 585.0 },
  { symbol: "NSE:DMART-EQ", ticker: "DMART", name: "Avenue Supermarts", sector: "Consumer", defaultAvgVolume: 451016, basePrice: 4920.0 },
  { symbol: "NSE:ZOMATO-EQ", ticker: "ZOMATO", name: "Zomato Ltd", sector: "Consumer", defaultAvgVolume: 42000000, basePrice: 265.0 },
  { symbol: "NSE:NYKAA-EQ", ticker: "NYKAA", name: "FSN E-Commerce (Nykaa)", sector: "Consumer", defaultAvgVolume: 4251400, basePrice: 215.0 },
  { symbol: "NSE:NAUKRI-EQ", ticker: "NAUKRI", name: "Info Edge (Naukri.com)", sector: "Consumer", defaultAvgVolume: 1575915, basePrice: 8900.0 },
  { symbol: "NSE:POLICYBZR-EQ", ticker: "POLICYBZR", name: "PB Fintech (PolicyBazaar)", sector: "Consumer", defaultAvgVolume: 1366459, basePrice: 1680.0 },
  { symbol: "NSE:PAYTM-EQ", ticker: "PAYTM", name: "One 97 Communications (Paytm)", sector: "Consumer", defaultAvgVolume: 4407025, basePrice: 615.0 },
  { symbol: "NSE:INDIAMART-EQ", ticker: "INDIAMART", name: "IndiaMART InterMESH", sector: "Consumer", defaultAvgVolume: 109363, basePrice: 2450.0 },
  { symbol: "NSE:KALYANKJIL-EQ", ticker: "KALYANKJIL", name: "Kalyan Jewellers India", sector: "Consumer", defaultAvgVolume: 8055131, basePrice: 580.0 },
  { symbol: "NSE:PAGEIND-EQ", ticker: "PAGEIND", name: "Page Industries Ltd", sector: "Consumer", defaultAvgVolume: 30112, basePrice: 47500.0 },
  { symbol: "NSE:RAYMOND-EQ", ticker: "RAYMOND", name: "Raymond Ltd", sector: "Consumer", defaultAvgVolume: 4116585, basePrice: 1980.0 },
  { symbol: "NSE:SENCO-EQ", ticker: "SENCO", name: "Senco Gold Ltd", sector: "Consumer", defaultAvgVolume: 1165295, basePrice: 1050.0 },
];

export const FALLBACK_UNIVERSES: Universe[] = [
  { id: 'nifty_500', name: 'NIFTY 500', category: 'Key Indices', description: 'Broad Indian market equity universe (All 200 instruments)', symbols_count: FALLBACK_CATALOG.length },
  { id: 'nifty_50', name: 'NIFTY 50', category: 'Key Indices', description: 'Top 50 large-cap bluechip stocks on NSE', symbols_count: 50 },
  { id: 'nifty_next_50', name: 'NIFTY NEXT 50', category: 'Key Indices', description: 'Next 50 potential large-cap contenders', symbols_count: 50 },
  { id: 'nifty_100', name: 'NIFTY 100', category: 'Key Indices', description: 'Top 100 liquid stocks combining NIFTY 50 and Next 50', symbols_count: 100 },
  { id: 'nifty_bank', name: 'NIFTY Bank', category: 'Sectoral Indices', description: 'Banking institutions listed on NSE', symbols_count: 16 },
  { id: 'nifty_it', name: 'NIFTY IT', category: 'Sectoral Indices', description: 'Information Technology and software services', symbols_count: 18 },
  { id: 'nifty_auto', name: 'NIFTY Auto', category: 'Sectoral Indices', description: 'Automobile and auto-ancillary manufacturers', symbols_count: 15 },
  { id: 'nifty_pharma', name: 'NIFTY Pharma', category: 'Sectoral Indices', description: 'Pharmaceutical and healthcare corporations', symbols_count: 16 },
  { id: 'nifty_fmcg', name: 'NIFTY FMCG', category: 'Sectoral Indices', description: 'Fast Moving Consumer Goods enterprises', symbols_count: 13 },
  { id: 'nifty_energy', name: 'NIFTY Energy', category: 'Sectoral Indices', description: 'Oil, gas, power and renewable energy', symbols_count: 15 },
  { id: 'nifty_metal', name: 'NIFTY Metal', category: 'Sectoral Indices', description: 'Ferrous and non-ferrous metal producers', symbols_count: 11 },
  { id: 'nifty_financial_services', name: 'NIFTY Financial Services', category: 'Sectoral Indices', description: 'Financial institutions, NBFCs and Banking', symbols_count: 31 },
  { id: 'nifty_realty', name: 'NIFTY Realty', category: 'Sectoral Indices', description: 'Real estate developers and housing infra', symbols_count: 10 },
  { id: 'nifty_defence', name: 'NIFTY Defence & Infra', category: 'Thematic', description: 'Defence PSUs, Railways, and Capital Goods', symbols_count: 25 },
];

export const FALLBACK_SECTORS: string[] = [
  "Automobile",
  "Banking",
  "Capital Goods",
  "Chemicals",
  "Consumer",
  "Defence",
  "Energy",
  "FMCG",
  "Financial Services",
  "Healthcare",
  "IT",
  "Industrials",
  "Infra",
  "Metals",
  "Pharma",
  "Real Estate",
  "Telecom"
];

/**
 * Initializes baseline ticks from fallback catalog
 */
export function createInitialTicks(): Record<string, MarketTick> {
  const map: Record<string, MarketTick> = {};
  const now = Math.floor(Date.now() / 1000);

  FALLBACK_CATALOG.forEach((item, idx) => {
    const changePct = ((idx % 7) - 3) * 0.72;
    const prevClose = Math.round((item.basePrice / (1 + changePct / 100)) * 100) / 100;
    const change = Math.round((item.basePrice - prevClose) * 100) / 100;
    const isSpike = ['NSE:INFY-EQ', 'NSE:SBIN-EQ', 'NSE:TATAMOTORS-EQ', 'NSE:TITAN-EQ', 'NSE:RELIANCE-EQ', 'NSE:HDFCBANK-EQ'].includes(item.symbol);
    const rvol = isSpike ? 2.45 : Math.round((0.8 + ((idx % 12) / 10)) * 100) / 100;
    const todayVol = Math.round(item.defaultAvgVolume * rvol);

    map[item.symbol] = {
      symbol: item.symbol,
      ticker: item.ticker,
      company_name: item.name,
      sector: item.sector,
      ltp: item.basePrice,
      prev_close: prevClose,
      change: change,
      change_percent: changePct,
      today_volume: todayVol,
      avg_volume: item.defaultAvgVolume,
      relative_volume: rvol,
      open_price: prevClose,
      high_price: Math.max(item.basePrice, prevClose * 1.015),
      low_price: Math.min(item.basePrice, prevClose * 0.985),
      timestamp: now,
      is_volume_spike: rvol >= 2.0,
    };
  });

  return map;
}

/**
 * Computes market summary from ticks list
 */
export function computeSummary(ticks: MarketTick[]): MarketSummary {
  let aboveAvg = 0;
  let highRvol = 0;
  let gainers = 0;
  let losers = 0;
  let unchanged = 0;
  let totalVol = 0;

  ticks.forEach((t) => {
    totalVol += t.today_volume;
    if (t.today_volume > t.avg_volume) aboveAvg++;
    if (t.relative_volume >= 2.0) highRvol++;
    if (t.change > 0) gainers++;
    else if (t.change < 0) losers++;
    else unchanged++;
  });

  return {
    stocks_monitored: ticks.length,
    above_average_volume: aboveAvg,
    high_rvol: highRvol,
    gainers: gainers,
    losers: losers,
    unchanged: unchanged,
    total_volume_traded: totalVol,
    last_update_time: Math.floor(Date.now() / 1000),
  };
}
