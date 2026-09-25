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
  { symbol: "NSE:360ONE-EQ", ticker: "360ONE", name: "360 ONE WAM Limited", sector: "Financial Services", defaultAvgVolume: 500000, basePrice: 1081.0 },
  { symbol: "NSE:ABB-EQ", ticker: "ABB", name: "ABB India Limited", sector: "Capital Goods", defaultAvgVolume: 171369, basePrice: 7084.0 },
  { symbol: "NSE:APLAPOLLO-EQ", ticker: "APLAPOLLO", name: "APL Apollo Tubes Limited", sector: "Industrials", defaultAvgVolume: 653437, basePrice: 2195.7 },
  { symbol: "NSE:AUBANK-EQ", ticker: "AUBANK", name: "AU Small Finance Bank Limited", sector: "Banking", defaultAvgVolume: 1319748, basePrice: 1013.4 },
  { symbol: "NSE:ADANIENSOL-EQ", ticker: "ADANIENSOL", name: "Adani Energy Solutions Limited", sector: "Energy", defaultAvgVolume: 829829, basePrice: 1329.1 },
  { symbol: "NSE:ADANIENT-EQ", ticker: "ADANIENT", name: "Adani Enterprises Limited", sector: "Metals", defaultAvgVolume: 1779170, basePrice: 2913.6 },
  { symbol: "NSE:ADANIGREEN-EQ", ticker: "ADANIGREEN", name: "Adani Green Energy Limited", sector: "Energy", defaultAvgVolume: 1435478, basePrice: 1289.2 },
  { symbol: "NSE:ADANIPORTS-EQ", ticker: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Limited", sector: "Infra", defaultAvgVolume: 2224769, basePrice: 1787.8 },
  { symbol: "NSE:ADANIPOWER-EQ", ticker: "ADANIPOWER", name: "Adani Power Limited", sector: "Energy", defaultAvgVolume: 11023480, basePrice: 202.03 },
  { symbol: "NSE:ABCAPITAL-EQ", ticker: "ABCAPITAL", name: "Aditya Birla Capital Limited", sector: "Financial Services", defaultAvgVolume: 1306509, basePrice: 386.75 },
  { symbol: "NSE:ALKEM-EQ", ticker: "ALKEM", name: "Alkem Laboratories Limited", sector: "Pharma", defaultAvgVolume: 152071, basePrice: 5249.5 },
  { symbol: "NSE:AMBER-EQ", ticker: "AMBER", name: "Amber Enterprises India Limited", sector: "Consumer", defaultAvgVolume: 500000, basePrice: 6956.0 },
  { symbol: "NSE:AMBUJACEM-EQ", ticker: "AMBUJACEM", name: "Ambuja Cements Limited", sector: "Industrials", defaultAvgVolume: 672106, basePrice: 384.5 },
  { symbol: "NSE:ANGELONE-EQ", ticker: "ANGELONE", name: "Angel One Limited", sector: "Financial Services", defaultAvgVolume: 1688517, basePrice: 289.6 },
  { symbol: "NSE:APOLLOHOSP-EQ", ticker: "APOLLOHOSP", name: "Apollo Hospitals Enterprise Limited", sector: "Healthcare", defaultAvgVolume: 360727, basePrice: 8872.5 },
  { symbol: "NSE:ASHOKLEY-EQ", ticker: "ASHOKLEY", name: "Ashok Leyland Limited", sector: "Automobile", defaultAvgVolume: 14065336, basePrice: 157.89 },
  { symbol: "NSE:ASIANPAINT-EQ", ticker: "ASIANPAINT", name: "Asian Paints Limited", sector: "Consumer", defaultAvgVolume: 573231, basePrice: 2424.3 },
  { symbol: "NSE:ASTRAL-EQ", ticker: "ASTRAL", name: "Astral Limited", sector: "Industrials", defaultAvgVolume: 1297231, basePrice: 1393.1 },
  { symbol: "NSE:AUROPHARMA-EQ", ticker: "AUROPHARMA", name: "Aurobindo Pharma Limited", sector: "Pharma", defaultAvgVolume: 800025, basePrice: 1718.2 },
  { symbol: "NSE:DMART-EQ", ticker: "DMART", name: "Avenue Supermarts Limited", sector: "Consumer", defaultAvgVolume: 451016, basePrice: 3803.0 },
  { symbol: "NSE:AXISBANK-EQ", ticker: "AXISBANK", name: "Axis Bank Limited", sector: "Banking", defaultAvgVolume: 4612753, basePrice: 1209.1 },
  { symbol: "NSE:BSE-EQ", ticker: "BSE", name: "BSE Limited", sector: "Financial Services", defaultAvgVolume: 2441739, basePrice: 3171.0 },
  { symbol: "NSE:BAJAJ-AUTO-EQ", ticker: "BAJAJ-AUTO", name: "Bajaj Auto Limited", sector: "Automobile", defaultAvgVolume: 216262, basePrice: 11245.0 },
  { symbol: "NSE:BAJFINANCE-EQ", ticker: "BAJFINANCE", name: "Bajaj Finance Limited", sector: "Financial Services", defaultAvgVolume: 5013468, basePrice: 985.3 },
  { symbol: "NSE:BAJAJFINSV-EQ", ticker: "BAJAJFINSV", name: "Bajaj Finserv Limited", sector: "Financial Services", defaultAvgVolume: 631827, basePrice: 1764.6 },
  { symbol: "NSE:BAJAJHLDNG-EQ", ticker: "BAJAJHLDNG", name: "Bajaj Holdings & Investment Limited", sector: "Financial Services", defaultAvgVolume: 500000, basePrice: 10834.0 },
  { symbol: "NSE:BANDHANBNK-EQ", ticker: "BANDHANBNK", name: "Bandhan Bank Limited", sector: "Banking", defaultAvgVolume: 9658766, basePrice: 183.45 },
  { symbol: "NSE:BANKBARODA-EQ", ticker: "BANKBARODA", name: "Bank of Baroda", sector: "Banking", defaultAvgVolume: 7503783, basePrice: 234.7 },
  { symbol: "NSE:BANKINDIA-EQ", ticker: "BANKINDIA", name: "Bank of India", sector: "Banking", defaultAvgVolume: 5292009, basePrice: 137.49 },
  { symbol: "NSE:BDL-EQ", ticker: "BDL", name: "Bharat Dynamics Limited", sector: "Defence", defaultAvgVolume: 500000, basePrice: 1148.9 },
  { symbol: "NSE:BEL-EQ", ticker: "BEL", name: "Bharat Electronics Limited", sector: "Defence", defaultAvgVolume: 9908320, basePrice: 391.0 },
  { symbol: "NSE:BHARATFORG-EQ", ticker: "BHARATFORG", name: "Bharat Forge Limited", sector: "Capital Goods", defaultAvgVolume: 1057941, basePrice: 1987.6 },
  { symbol: "NSE:BHEL-EQ", ticker: "BHEL", name: "Bharat Heavy Electricals Limited", sector: "Capital Goods", defaultAvgVolume: 7364608, basePrice: 414.3 },
  { symbol: "NSE:BPCL-EQ", ticker: "BPCL", name: "Bharat Petroleum Corporation Limited", sector: "Energy", defaultAvgVolume: 5001736, basePrice: 306.85 },
  { symbol: "NSE:BHARTIARTL-EQ", ticker: "BHARTIARTL", name: "Bharti Airtel Limited", sector: "Telecom", defaultAvgVolume: 6459363, basePrice: 1793.5 },
  { symbol: "NSE:BIOCON-EQ", ticker: "BIOCON", name: "Biocon Limited", sector: "Healthcare", defaultAvgVolume: 3114622, basePrice: 383.75 },
  { symbol: "NSE:BLUESTARCO-EQ", ticker: "BLUESTARCO", name: "Blue Star Limited", sector: "Consumer", defaultAvgVolume: 500000, basePrice: 1546.9 },
  { symbol: "NSE:BOSCHLTD-EQ", ticker: "BOSCHLTD", name: "Bosch Limited", sector: "Automobile", defaultAvgVolume: 40260, basePrice: 48015.0 },
  { symbol: "NSE:BRITANNIA-EQ", ticker: "BRITANNIA", name: "Britannia Industries Limited", sector: "FMCG", defaultAvgVolume: 263981, basePrice: 4902.0 },
  { symbol: "NSE:CGPOWER-EQ", ticker: "CGPOWER", name: "CG Power and Industrial Solutions Limited", sector: "Capital Goods", defaultAvgVolume: 2352096, basePrice: 884.25 },
  { symbol: "NSE:CANBK-EQ", ticker: "CANBK", name: "Canara Bank", sector: "Banking", defaultAvgVolume: 12044884, basePrice: 125.06 },
  { symbol: "NSE:CDSL-EQ", ticker: "CDSL", name: "Central Depository Services (India) Limited", sector: "Financial Services", defaultAvgVolume: 577483, basePrice: 1323.9 },
  { symbol: "NSE:CHOLAFIN-EQ", ticker: "CHOLAFIN", name: "Cholamandalam Investment and Finance Company Limited", sector: "Financial Services", defaultAvgVolume: 1074840, basePrice: 1650.1 },
  { symbol: "NSE:CIPLA-EQ", ticker: "CIPLA", name: "Cipla Limited", sector: "Pharma", defaultAvgVolume: 807387, basePrice: 1404.5 },
  { symbol: "NSE:COALINDIA-EQ", ticker: "COALINDIA", name: "Coal India Limited", sector: "Energy", defaultAvgVolume: 9629879, basePrice: 424.9 },
  { symbol: "NSE:COCHINSHIP-EQ", ticker: "COCHINSHIP", name: "Cochin Shipyard Limited", sector: "Defence", defaultAvgVolume: 1090049, basePrice: 1378.1 },
  { symbol: "NSE:COFORGE-EQ", ticker: "COFORGE", name: "Coforge Limited", sector: "IT", defaultAvgVolume: 2391632, basePrice: 1784.7 },
  { symbol: "NSE:COLPAL-EQ", ticker: "COLPAL", name: "Colgate Palmolive (India) Limited", sector: "FMCG", defaultAvgVolume: 417602, basePrice: 1836.2 },
  { symbol: "NSE:CAMS-EQ", ticker: "CAMS", name: "Computer Age Management Services Limited", sector: "Financial Services", defaultAvgVolume: 500000, basePrice: 704.9 },
  { symbol: "NSE:CONCOR-EQ", ticker: "CONCOR", name: "Container Corporation of India Limited", sector: "Industrials", defaultAvgVolume: 1378498, basePrice: 463.05 },
  { symbol: "NSE:CROMPTON-EQ", ticker: "CROMPTON", name: "Crompton Greaves Consumer Electricals Limited", sector: "Consumer", defaultAvgVolume: 733518, basePrice: 219.19 },
  { symbol: "NSE:CUMMINSIND-EQ", ticker: "CUMMINSIND", name: "Cummins India Limited", sector: "Capital Goods", defaultAvgVolume: 420428, basePrice: 4940.0 },
  { symbol: "NSE:DLF-EQ", ticker: "DLF", name: "DLF Limited", sector: "Real Estate", defaultAvgVolume: 3351674, basePrice: 679.6 },
  { symbol: "NSE:DABUR-EQ", ticker: "DABUR", name: "Dabur India Limited", sector: "FMCG", defaultAvgVolume: 1938500, basePrice: 384.35 },
  { symbol: "NSE:DALBHARAT-EQ", ticker: "DALBHARAT", name: "Dalmia Bharat Limited", sector: "Industrials", defaultAvgVolume: 500000, basePrice: 1703.7 },
  { symbol: "NSE:DELHIVERY-EQ", ticker: "DELHIVERY", name: "Delhivery Limited", sector: "Industrials", defaultAvgVolume: 1399700, basePrice: 421.15 },
  { symbol: "NSE:DIVISLAB-EQ", ticker: "DIVISLAB", name: "Divi's Laboratories Limited", sector: "Pharma", defaultAvgVolume: 464262, basePrice: 9581.0 },
  { symbol: "NSE:DIXON-EQ", ticker: "DIXON", name: "Dixon Technologies (India) Limited", sector: "Consumer", defaultAvgVolume: 358810, basePrice: 13400.0 },
  { symbol: "NSE:DRREDDY-EQ", ticker: "DRREDDY", name: "Dr. Reddy's Laboratories Limited", sector: "Pharma", defaultAvgVolume: 1550971, basePrice: 1200.6 },
  { symbol: "NSE:ETERNAL-EQ", ticker: "ETERNAL", name: "Eternal Limited", sector: "Consumer", defaultAvgVolume: 13364458, basePrice: 332.45 },
  { symbol: "NSE:EICHERMOT-EQ", ticker: "EICHERMOT", name: "Eicher Motors Limited", sector: "Automobile", defaultAvgVolume: 391393, basePrice: 7313.0 },
  { symbol: "NSE:FORCEMOT-EQ", ticker: "FORCEMOT", name: "Force Motors Limited", sector: "Automobile", defaultAvgVolume: 500000, basePrice: 17300.0 },
  { symbol: "NSE:NYKAA-EQ", ticker: "NYKAA", name: "FSN E-Commerce Ventures (Nykaa)", sector: "Consumer", defaultAvgVolume: 4251400, basePrice: 333.2 },
  { symbol: "NSE:FORTIS-EQ", ticker: "FORTIS", name: "Fortis Healthcare Limited", sector: "Healthcare", defaultAvgVolume: 1189140, basePrice: 847.75 },
  { symbol: "NSE:GAIL-EQ", ticker: "GAIL", name: "GAIL (India) Limited", sector: "Energy", defaultAvgVolume: 6527941, basePrice: 173.5 },
  { symbol: "NSE:GVT&D-EQ", ticker: "GVT&D", name: "GE Vernova T&D India Limited", sector: "Capital Goods", defaultAvgVolume: 500000, basePrice: 4265.4 },
  { symbol: "NSE:GMRAIRPORT-EQ", ticker: "GMRAIRPORT", name: "GMR Airports Limited", sector: "Infra", defaultAvgVolume: 13184926, basePrice: 97.38 },
  { symbol: "NSE:GLENMARK-EQ", ticker: "GLENMARK", name: "Glenmark Pharmaceuticals Limited", sector: "Pharma", defaultAvgVolume: 486395, basePrice: 2388.7 },
  { symbol: "NSE:GODFRYPHLP-EQ", ticker: "GODFRYPHLP", name: "Godfrey Phillips India Limited", sector: "FMCG", defaultAvgVolume: 500000, basePrice: 1982.5 },
  { symbol: "NSE:GODREJCP-EQ", ticker: "GODREJCP", name: "Godrej Consumer Products Limited", sector: "FMCG", defaultAvgVolume: 2277058, basePrice: 875.55 },
  { symbol: "NSE:GODREJPROP-EQ", ticker: "GODREJPROP", name: "Godrej Properties Limited", sector: "Real Estate", defaultAvgVolume: 642760, basePrice: 1692.0 },
  { symbol: "NSE:GRASIM-EQ", ticker: "GRASIM", name: "Grasim Industries Limited", sector: "Industrials", defaultAvgVolume: 500000, basePrice: 3168.0 },
  { symbol: "NSE:HCLTECH-EQ", ticker: "HCLTECH", name: "HCL Technologies Limited", sector: "IT", defaultAvgVolume: 2154149, basePrice: 1258.5 },
  { symbol: "NSE:HDFCAMC-EQ", ticker: "HDFCAMC", name: "HDFC Asset Management Company Limited", sector: "Financial Services", defaultAvgVolume: 500000, basePrice: 2375.5 },
  { symbol: "NSE:HDFCBANK-EQ", ticker: "HDFCBANK", name: "HDFC Bank Limited", sector: "Banking", defaultAvgVolume: 28192170, basePrice: 733.95 },
  { symbol: "NSE:HDFCLIFE-EQ", ticker: "HDFCLIFE", name: "HDFC Life Insurance Company Limited", sector: "Financial Services", defaultAvgVolume: 3249593, basePrice: 527.4 },
  { symbol: "NSE:HAVELLS-EQ", ticker: "HAVELLS", name: "Havells India Limited", sector: "Consumer", defaultAvgVolume: 785126, basePrice: 1093.5 },
  { symbol: "NSE:HEROMOTOCO-EQ", ticker: "HEROMOTOCO", name: "Hero MotoCorp Limited", sector: "Automobile", defaultAvgVolume: 553616, basePrice: 5318.0 },
  { symbol: "NSE:HINDALCO-EQ", ticker: "HINDALCO", name: "Hindalco Industries Limited", sector: "Metals", defaultAvgVolume: 3584594, basePrice: 975.7 },
  { symbol: "NSE:HAL-EQ", ticker: "HAL", name: "Hindustan Aeronautics Limited", sector: "Defence", defaultAvgVolume: 921849, basePrice: 4779.0 },
  { symbol: "NSE:HINDPETRO-EQ", ticker: "HINDPETRO", name: "Hindustan Petroleum Corporation Limited", sector: "Energy", defaultAvgVolume: 1475321, basePrice: 352.15 },
  { symbol: "NSE:HINDUNILVR-EQ", ticker: "HINDUNILVR", name: "Hindustan Unilever Limited", sector: "FMCG", defaultAvgVolume: 1205415, basePrice: 1923.4 },
  { symbol: "NSE:HINDZINC-EQ", ticker: "HINDZINC", name: "Hindustan Zinc Limited", sector: "Metals", defaultAvgVolume: 1664089, basePrice: 589.8 },
  { symbol: "NSE:POWERINDIA-EQ", ticker: "POWERINDIA", name: "Hitachi Energy India Limited", sector: "Capital Goods", defaultAvgVolume: 500000, basePrice: 31005.0 },
  { symbol: "NSE:HYUNDAI-EQ", ticker: "HYUNDAI", name: "Hyundai Motor India Limited", sector: "Automobile", defaultAvgVolume: 1033273, basePrice: 2103.8 },
  { symbol: "NSE:ICICIBANK-EQ", ticker: "ICICIBANK", name: "ICICI Bank Limited", sector: "Banking", defaultAvgVolume: 8606334, basePrice: 1328.7 },
  { symbol: "NSE:ICICIGI-EQ", ticker: "ICICIGI", name: "ICICI Lombard General Insurance Company Limited", sector: "Financial Services", defaultAvgVolume: 845378, basePrice: 1568.0 },
  { symbol: "NSE:ICICIPRULI-EQ", ticker: "ICICIPRULI", name: "ICICI Prudential Life Insurance Company Limited", sector: "Financial Services", defaultAvgVolume: 577641, basePrice: 461.55 },
  { symbol: "NSE:IDFCFIRSTB-EQ", ticker: "IDFCFIRSTB", name: "IDFC First Bank Limited", sector: "Banking", defaultAvgVolume: 16560324, basePrice: 83.87 },
  { symbol: "NSE:ITC-EQ", ticker: "ITC", name: "ITC Limited", sector: "FMCG", defaultAvgVolume: 13209452, basePrice: 267.6 },
  { symbol: "NSE:INDIANB-EQ", ticker: "INDIANB", name: "Indian Bank", sector: "Banking", defaultAvgVolume: 500000, basePrice: 829.9 },
  { symbol: "NSE:IEX-EQ", ticker: "IEX", name: "Indian Energy Exchange Limited", sector: "Financial Services", defaultAvgVolume: 895365, basePrice: 112.37 },
  { symbol: "NSE:IOC-EQ", ticker: "IOC", name: "Indian Oil Corporation Limited", sector: "Energy", defaultAvgVolume: 8035637, basePrice: 135.78 },
  { symbol: "NSE:IRFC-EQ", ticker: "IRFC", name: "Indian Railway Finance Corporation Limited", sector: "Financial Services", defaultAvgVolume: 7175998, basePrice: 79.47 },
  { symbol: "NSE:IREDA-EQ", ticker: "IREDA", name: "Indian Renewable Energy Development Agency Limited", sector: "Financial Services", defaultAvgVolume: 4222466, basePrice: 112.9 },
  { symbol: "NSE:INDUSTOWER-EQ", ticker: "INDUSTOWER", name: "Indus Towers Limited", sector: "Telecom", defaultAvgVolume: 4826134, basePrice: 376.45 },
  { symbol: "NSE:INDUSINDBK-EQ", ticker: "INDUSINDBK", name: "IndusInd Bank Limited", sector: "Banking", defaultAvgVolume: 1531161, basePrice: 910.1 },
  { symbol: "NSE:NAUKRI-EQ", ticker: "NAUKRI", name: "Info Edge (India) Limited", sector: "IT", defaultAvgVolume: 1575915, basePrice: 1247.0 },
  { symbol: "NSE:INFY-EQ", ticker: "INFY", name: "Infosys Limited", sector: "IT", defaultAvgVolume: 8433014, basePrice: 1001.4 },
  { symbol: "NSE:INOXWIND-EQ", ticker: "INOXWIND", name: "Inox Wind Limited", sector: "Energy", defaultAvgVolume: 5289681, basePrice: 74.17 },
  { symbol: "NSE:INDIGO-EQ", ticker: "INDIGO", name: "InterGlobe Aviation Limited", sector: "Consumer", defaultAvgVolume: 500000, basePrice: 4907.5 },
  { symbol: "NSE:JINDALSTEL-EQ", ticker: "JINDALSTEL", name: "Jindal Steel & Power Limited", sector: "Metals", defaultAvgVolume: 753974, basePrice: 1156.8 },
  { symbol: "NSE:JSWENERGY-EQ", ticker: "JSWENERGY", name: "JSW Energy Limited", sector: "Energy", defaultAvgVolume: 1022266, basePrice: 506.25 },
  { symbol: "NSE:JSWSTEEL-EQ", ticker: "JSWSTEEL", name: "JSW Steel Limited", sector: "Metals", defaultAvgVolume: 1549306, basePrice: 1272.6 },
  { symbol: "NSE:JIOFIN-EQ", ticker: "JIOFIN", name: "Jio Financial Services Limited", sector: "Financial Services", defaultAvgVolume: 4269684, basePrice: 226.62 },
  { symbol: "NSE:JUBLFOOD-EQ", ticker: "JUBLFOOD", name: "Jubilant Foodworks Limited", sector: "Consumer", defaultAvgVolume: 500000, basePrice: 481.45 },
  { symbol: "NSE:KEI-EQ", ticker: "KEI", name: "KEI Industries Limited", sector: "Capital Goods", defaultAvgVolume: 545235, basePrice: 4662.0 },
  { symbol: "NSE:KPITTECH-EQ", ticker: "KPITTECH", name: "KPIT Technologies Limited", sector: "IT", defaultAvgVolume: 1498729, basePrice: 515.65 },
  { symbol: "NSE:KALYANKJIL-EQ", ticker: "KALYANKJIL", name: "Kalyan Jewellers India Limited", sector: "Consumer", defaultAvgVolume: 8055131, basePrice: 570.4 },
  { symbol: "NSE:KAYNES-EQ", ticker: "KAYNES", name: "Kaynes Technology India Limited", sector: "Capital Goods", defaultAvgVolume: 1134995, basePrice: 3625.0 },
  { symbol: "NSE:KFINTECH-EQ", ticker: "KFINTECH", name: "KFin Technologies Limited", sector: "Financial Services", defaultAvgVolume: 500000, basePrice: 898.4 },
  { symbol: "NSE:KOTAKBANK-EQ", ticker: "KOTAKBANK", name: "Kotak Mahindra Bank Limited", sector: "Banking", defaultAvgVolume: 11352383, basePrice: 404.35 },
  { symbol: "NSE:LTF-EQ", ticker: "LTF", name: "L&T Finance Limited", sector: "Financial Services", defaultAvgVolume: 4138425, basePrice: 282.4 },
  { symbol: "NSE:LICHSGFIN-EQ", ticker: "LICHSGFIN", name: "LIC Housing Finance Limited", sector: "Financial Services", defaultAvgVolume: 3515374, basePrice: 560.4 },
  { symbol: "NSE:LTM-EQ", ticker: "LTM", name: "LTM Limited", sector: "IT", defaultAvgVolume: 500000, basePrice: 4062.5 },
  { symbol: "NSE:LT-EQ", ticker: "LT", name: "Larsen & Toubro Limited", sector: "Capital Goods", defaultAvgVolume: 1386036, basePrice: 3850.7 },
  { symbol: "NSE:LAURUSLABS-EQ", ticker: "LAURUSLABS", name: "Laurus Labs Limited", sector: "Healthcare", defaultAvgVolume: 842924, basePrice: 1990.6 },
  { symbol: "NSE:LICI-EQ", ticker: "LICI", name: "Life Insurance Corporation Of India", sector: "Financial Services", defaultAvgVolume: 4302294, basePrice: 406.3 },
  { symbol: "NSE:LODHA-EQ", ticker: "LODHA", name: "Macrotech Developers (Lodha)", sector: "Real Estate", defaultAvgVolume: 1506878, basePrice: 1159.4 },
  { symbol: "NSE:LUPIN-EQ", ticker: "LUPIN", name: "Lupin Limited", sector: "Pharma", defaultAvgVolume: 739806, basePrice: 2084.7 },
  { symbol: "NSE:M&M-EQ", ticker: "M&M", name: "Mahindra & Mahindra Limited", sector: "Automobile", defaultAvgVolume: 1812230, basePrice: 3000.5 },
  { symbol: "NSE:MANAPPURAM-EQ", ticker: "MANAPPURAM", name: "Manappuram Finance Limited", sector: "Financial Services", defaultAvgVolume: 5651521, basePrice: 330.75 },
  { symbol: "NSE:MANKIND-EQ", ticker: "MANKIND", name: "Mankind Pharma Limited", sector: "Pharma", defaultAvgVolume: 397672, basePrice: 2492.4 },
  { symbol: "NSE:MARICO-EQ", ticker: "MARICO", name: "Marico Limited", sector: "FMCG", defaultAvgVolume: 1620234, basePrice: 813.2 },
  { symbol: "NSE:MARUTI-EQ", ticker: "MARUTI", name: "Maruti Suzuki India Limited", sector: "Automobile", defaultAvgVolume: 342157, basePrice: 12032.0 },
  { symbol: "NSE:MFSL-EQ", ticker: "MFSL", name: "Max Financial Services Limited", sector: "Financial Services", defaultAvgVolume: 2428286, basePrice: 1450.3 },
  { symbol: "NSE:MAXHEALTH-EQ", ticker: "MAXHEALTH", name: "Max Healthcare Institute Limited", sector: "Healthcare", defaultAvgVolume: 1991988, basePrice: 1020.6 },
  { symbol: "NSE:MAZDOCK-EQ", ticker: "MAZDOCK", name: "Mazagon Dock Shipbuilders Limited", sector: "Defence", defaultAvgVolume: 701191, basePrice: 2196.7 },
  { symbol: "NSE:MOTILALOFS-EQ", ticker: "MOTILALOFS", name: "Motilal Oswal Financial Services Limited", sector: "Financial Services", defaultAvgVolume: 530785, basePrice: 1037.7 },
  { symbol: "NSE:MPHASIS-EQ", ticker: "MPHASIS", name: "Mphasis Limited", sector: "IT", defaultAvgVolume: 416207, basePrice: 2225.0 },
  { symbol: "NSE:MCX-EQ", ticker: "MCX", name: "Multi Commodity Exchange of India Limited", sector: "Financial Services", defaultAvgVolume: 1395099, basePrice: 3351.8 },
  { symbol: "NSE:MUTHOOTFIN-EQ", ticker: "MUTHOOTFIN", name: "Muthoot Finance Limited", sector: "Financial Services", defaultAvgVolume: 850920, basePrice: 2811.7 },
  { symbol: "NSE:NBCC-EQ", ticker: "NBCC", name: "NBCC (India) Limited", sector: "Real Estate", defaultAvgVolume: 5290068, basePrice: 82.34 },
  { symbol: "NSE:NHPC-EQ", ticker: "NHPC", name: "NHPC Limited", sector: "Energy", defaultAvgVolume: 9307310, basePrice: 75.63 },
  { symbol: "NSE:NMDC-EQ", ticker: "NMDC", name: "NMDC Limited", sector: "Metals", defaultAvgVolume: 15597010, basePrice: 80.12 },
  { symbol: "NSE:NTPC-EQ", ticker: "NTPC", name: "NTPC Limited", sector: "Energy", defaultAvgVolume: 8104784, basePrice: 324.8 },
  { symbol: "NSE:NATIONALUM-EQ", ticker: "NATIONALUM", name: "National Aluminium Company Limited", sector: "Metals", defaultAvgVolume: 6522159, basePrice: 359.1 },
  { symbol: "NSE:NESTLEIND-EQ", ticker: "NESTLEIND", name: "Nestle India Limited", sector: "FMCG", defaultAvgVolume: 1424439, basePrice: 1354.0 },
  { symbol: "NSE:NAM-INDIA-EQ", ticker: "NAM-INDIA", name: "Nippon Life India Asset Management Limited", sector: "Financial Services", defaultAvgVolume: 500000, basePrice: 1142.5 },
  { symbol: "NSE:OBEROIRLTY-EQ", ticker: "OBEROIRLTY", name: "Oberoi Realty Limited", sector: "Real Estate", defaultAvgVolume: 517706, basePrice: 1866.9 },
  { symbol: "NSE:ONGC-EQ", ticker: "ONGC", name: "Oil & Natural Gas Corporation Limited", sector: "Energy", defaultAvgVolume: 11466660, basePrice: 235.05 },
  { symbol: "NSE:OIL-EQ", ticker: "OIL", name: "Oil India Limited", sector: "Energy", defaultAvgVolume: 2590309, basePrice: 472.7 },
  { symbol: "NSE:PAYTM-EQ", ticker: "PAYTM", name: "One 97 Communications (Paytm)", sector: "Financial Services", defaultAvgVolume: 4407025, basePrice: 1675.2 },
  { symbol: "NSE:OFSS-EQ", ticker: "OFSS", name: "Oracle Financial Services Software Limited", sector: "IT", defaultAvgVolume: 219626, basePrice: 10581.0 },
  { symbol: "NSE:POLICYBZR-EQ", ticker: "POLICYBZR", name: "PB Fintech Limited (PolicyBazaar)", sector: "Financial Services", defaultAvgVolume: 1366459, basePrice: 1151.2 },
  { symbol: "NSE:PGEL-EQ", ticker: "PGEL", name: "PG Electroplast Limited", sector: "Consumer", defaultAvgVolume: 500000, basePrice: 514.5 },
  { symbol: "NSE:PIIND-EQ", ticker: "PIIND", name: "PI Industries Limited", sector: "Chemicals", defaultAvgVolume: 328530, basePrice: 2387.8 },
  { symbol: "NSE:PNBHOUSING-EQ", ticker: "PNBHOUSING", name: "PNB Housing Finance Limited", sector: "Financial Services", defaultAvgVolume: 883970, basePrice: 1086.7 },
  { symbol: "NSE:PAGEIND-EQ", ticker: "PAGEIND", name: "Page Industries Limited", sector: "Consumer", defaultAvgVolume: 30112, basePrice: 37470.0 },
  { symbol: "NSE:PATANJALI-EQ", ticker: "PATANJALI", name: "Patanjali Foods Limited", sector: "FMCG", defaultAvgVolume: 1021656, basePrice: 403.6 },
  { symbol: "NSE:PERSISTENT-EQ", ticker: "PERSISTENT", name: "Persistent Systems Limited", sector: "IT", defaultAvgVolume: 459812, basePrice: 5317.5 },
  { symbol: "NSE:PETRONET-EQ", ticker: "PETRONET", name: "Petronet LNG Limited", sector: "Energy", defaultAvgVolume: 501962, basePrice: 285.45 },
  { symbol: "NSE:PIDILITIND-EQ", ticker: "PIDILITIND", name: "Pidilite Industries Limited", sector: "Chemicals", defaultAvgVolume: 694606, basePrice: 1506.8 },
  { symbol: "NSE:POLYCAB-EQ", ticker: "POLYCAB", name: "Polycab India Limited", sector: "Capital Goods", defaultAvgVolume: 355036, basePrice: 8400.0 },
  { symbol: "NSE:PFC-EQ", ticker: "PFC", name: "Power Finance Corporation Limited", sector: "Financial Services", defaultAvgVolume: 8784637, basePrice: 338.1 },
  { symbol: "NSE:POWERGRID-EQ", ticker: "POWERGRID", name: "Power Grid Corporation of India Limited", sector: "Energy", defaultAvgVolume: 8664923, basePrice: 268.25 },
  { symbol: "NSE:PREMIERENE-EQ", ticker: "PREMIERENE", name: "Premier Energies Limited", sector: "Energy", defaultAvgVolume: 500000, basePrice: 888.9 },
  { symbol: "NSE:PRESTIGE-EQ", ticker: "PRESTIGE", name: "Prestige Estates Projects Limited", sector: "Real Estate", defaultAvgVolume: 499910, basePrice: 1467.8 },
  { symbol: "NSE:PNB-EQ", ticker: "PNB", name: "Punjab National Bank", sector: "Banking", defaultAvgVolume: 13539987, basePrice: 116.57 },
  { symbol: "NSE:RBLBANK-EQ", ticker: "RBLBANK", name: "RBL Bank Limited", sector: "Banking", defaultAvgVolume: 3192749, basePrice: 412.85 },
  { symbol: "NSE:RECLTD-EQ", ticker: "RECLTD", name: "REC Limited", sector: "Financial Services", defaultAvgVolume: 5434190, basePrice: 310.65 },
  { symbol: "NSE:RADICO-EQ", ticker: "RADICO", name: "Radico Khaitan Limited", sector: "Consumer", defaultAvgVolume: 261421, basePrice: 4550.3 },
  { symbol: "NSE:RVNL-EQ", ticker: "RVNL", name: "Rail Vikas Nigam Limited", sector: "Infra", defaultAvgVolume: 4521658, basePrice: 206.33 },
  { symbol: "NSE:RELIANCE-EQ", ticker: "RELIANCE", name: "Reliance Industries Limited", sector: "Energy", defaultAvgVolume: 10570845, basePrice: 1218.7 },
  { symbol: "NSE:SBICARD-EQ", ticker: "SBICARD", name: "SBI Cards and Payment Services Limited", sector: "Financial Services", defaultAvgVolume: 2783912, basePrice: 613.25 },
  { symbol: "NSE:SBILIFE-EQ", ticker: "SBILIFE", name: "SBI Life Insurance Company Limited", sector: "Financial Services", defaultAvgVolume: 879620, basePrice: 1740.8 },
  { symbol: "NSE:SHREECEM-EQ", ticker: "SHREECEM", name: "Shree Cement Limited", sector: "Industrials", defaultAvgVolume: 500000, basePrice: 22285.0 },
  { symbol: "NSE:SRF-EQ", ticker: "SRF", name: "SRF Limited", sector: "Chemicals", defaultAvgVolume: 232949, basePrice: 2497.1 },
  { symbol: "NSE:MOTHERSON-EQ", ticker: "MOTHERSON", name: "Samvardhana Motherson International Limited", sector: "Automobile", defaultAvgVolume: 11154726, basePrice: 162.48 },
  { symbol: "NSE:SHRIRAMFIN-EQ", ticker: "SHRIRAMFIN", name: "Shriram Finance Limited", sector: "Financial Services", defaultAvgVolume: 3727843, basePrice: 994.2 },
  { symbol: "NSE:SIEMENS-EQ", ticker: "SIEMENS", name: "Siemens Limited", sector: "Capital Goods", defaultAvgVolume: 367850, basePrice: 3843.9 },
  { symbol: "NSE:SOLARINDS-EQ", ticker: "SOLARINDS", name: "Solar Industries India Limited", sector: "Chemicals", defaultAvgVolume: 500000, basePrice: 19685.0 },
  { symbol: "NSE:SONACOMS-EQ", ticker: "SONACOMS", name: "Sona BLW Precision Forgings Limited", sector: "Automobile", defaultAvgVolume: 1852006, basePrice: 829.3 },
  { symbol: "NSE:SBIN-EQ", ticker: "SBIN", name: "State Bank of India", sector: "Banking", defaultAvgVolume: 7584694, basePrice: 979.0 },
  { symbol: "NSE:SAIL-EQ", ticker: "SAIL", name: "Steel Authority of India Limited", sector: "Metals", defaultAvgVolume: 21683732, basePrice: 183.85 },
  { symbol: "NSE:SUNPHARMA-EQ", ticker: "SUNPHARMA", name: "Sun Pharmaceutical Industries Limited", sector: "Pharma", defaultAvgVolume: 1538216, basePrice: 1849.2 },
  { symbol: "NSE:SUPREMEIND-EQ", ticker: "SUPREMEIND", name: "Supreme Industries Limited", sector: "Industrials", defaultAvgVolume: 500000, basePrice: 3491.0 },
  { symbol: "NSE:SUZLON-EQ", ticker: "SUZLON", name: "Suzlon Energy Limited", sector: "Energy", defaultAvgVolume: 43379504, basePrice: 40.26 },
  { symbol: "NSE:SWIGGY-EQ", ticker: "SWIGGY", name: "Swiggy Limited", sector: "Consumer", defaultAvgVolume: 4475280, basePrice: 262.8 },
  { symbol: "NSE:TATACONSUM-EQ", ticker: "TATACONSUM", name: "Tata Consumer Products Limited", sector: "FMCG", defaultAvgVolume: 1203700, basePrice: 984.5 },
  { symbol: "NSE:TVSMOTOR-EQ", ticker: "TVSMOTOR", name: "TVS Motor Company Limited", sector: "Automobile", defaultAvgVolume: 808817, basePrice: 4107.5 },
  { symbol: "NSE:TCS-EQ", ticker: "TCS", name: "Tata Consultancy Services Limited", sector: "IT", defaultAvgVolume: 2854080, basePrice: 2084.4 },
  { symbol: "NSE:TATAELXSI-EQ", ticker: "TATAELXSI", name: "Tata Elxsi Limited", sector: "IT", defaultAvgVolume: 194507, basePrice: 3179.2 },
  { symbol: "NSE:TMPV-EQ", ticker: "TMPV", name: "Tata Motors Passenger Vehicles Limited", sector: "Automobile", defaultAvgVolume: 16245897, basePrice: 290.25 },
  { symbol: "NSE:TATAPOWER-EQ", ticker: "TATAPOWER", name: "Tata Power Company Limited", sector: "Energy", defaultAvgVolume: 4737108, basePrice: 365.6 },
  { symbol: "NSE:TATASTEEL-EQ", ticker: "TATASTEEL", name: "Tata Steel Limited", sector: "Metals", defaultAvgVolume: 27706220, basePrice: 188.26 },
  { symbol: "NSE:TECHM-EQ", ticker: "TECHM", name: "Tech Mahindra Limited", sector: "IT", defaultAvgVolume: 2004274, basePrice: 1546.5 },
  { symbol: "NSE:FEDERALBNK-EQ", ticker: "FEDERALBNK", name: "The Federal Bank Limited", sector: "Banking", defaultAvgVolume: 5000328, basePrice: 331.1 },
  { symbol: "NSE:INDHOTEL-EQ", ticker: "INDHOTEL", name: "The Indian Hotels Company Limited", sector: "Consumer", defaultAvgVolume: 765000, basePrice: 723.85 },
  { symbol: "NSE:PHOENIXLTD-EQ", ticker: "PHOENIXLTD", name: "The Phoenix Mills Limited", sector: "Real Estate", defaultAvgVolume: 390785, basePrice: 1976.0 },
  { symbol: "NSE:TITAN-EQ", ticker: "TITAN", name: "Titan Company Limited", sector: "Consumer", defaultAvgVolume: 608985, basePrice: 4840.0 },
  { symbol: "NSE:TORNTPHARM-EQ", ticker: "TORNTPHARM", name: "Torrent Pharmaceuticals Limited", sector: "Pharma", defaultAvgVolume: 318636, basePrice: 4957.0 },
  { symbol: "NSE:TRENT-EQ", ticker: "TRENT", name: "Trent Limited", sector: "Consumer", defaultAvgVolume: 671162, basePrice: 2678.6 },
  { symbol: "NSE:TIINDIA-EQ", ticker: "TIINDIA", name: "Tube Investments of India Limited", sector: "Automobile", defaultAvgVolume: 361783, basePrice: 2536.1 },
  { symbol: "NSE:UNOMINDA-EQ", ticker: "UNOMINDA", name: "UNO Minda Limited", sector: "Automobile", defaultAvgVolume: 500000, basePrice: 1222.3 },
  { symbol: "NSE:UPL-EQ", ticker: "UPL", name: "UPL Limited", sector: "Chemicals", defaultAvgVolume: 841199, basePrice: 546.95 },
  { symbol: "NSE:ULTRACEMCO-EQ", ticker: "ULTRACEMCO", name: "UltraTech Cement Limited", sector: "Industrials", defaultAvgVolume: 500000, basePrice: 11036.0 },
  { symbol: "NSE:UNIONBANK-EQ", ticker: "UNIONBANK", name: "Union Bank of India", sector: "Banking", defaultAvgVolume: 8919461, basePrice: 179.6 },
  { symbol: "NSE:UNITDSPR-EQ", ticker: "UNITDSPR", name: "United Spirits Limited", sector: "Consumer", defaultAvgVolume: 500000, basePrice: 1426.5 },
  { symbol: "NSE:VBL-EQ", ticker: "VBL", name: "Varun Beverages Limited", sector: "FMCG", defaultAvgVolume: 6043003, basePrice: 432.35 },
  { symbol: "NSE:VEDL-EQ", ticker: "VEDL", name: "Vedanta Limited", sector: "Metals", defaultAvgVolume: 10142039, basePrice: 265.65 },
  { symbol: "NSE:VMM-EQ", ticker: "VMM", name: "Vishal Mega Mart Limited", sector: "Consumer", defaultAvgVolume: 4583438, basePrice: 103.77 },
  { symbol: "NSE:IDEA-EQ", ticker: "IDEA", name: "Vodafone Idea Limited", sector: "Telecom", defaultAvgVolume: 486236559, basePrice: 14.27 },
  { symbol: "NSE:VOLTAS-EQ", ticker: "VOLTAS", name: "Voltas Limited", sector: "Consumer", defaultAvgVolume: 926279, basePrice: 1119.6 },
  { symbol: "NSE:WAAREEENER-EQ", ticker: "WAAREEENER", name: "Waaree Energies Limited", sector: "Energy", defaultAvgVolume: 500000, basePrice: 2492.7 },
  { symbol: "NSE:WIPRO-EQ", ticker: "WIPRO", name: "Wipro Limited", sector: "IT", defaultAvgVolume: 9407361, basePrice: 163.0 },
  { symbol: "NSE:YESBANK-EQ", ticker: "YESBANK", name: "Yes Bank Limited", sector: "Banking", defaultAvgVolume: 62526440, basePrice: 22.4 },
  { symbol: "NSE:ZYDUSLIFE-EQ", ticker: "ZYDUSLIFE", name: "Zydus Lifesciences Limited", sector: "Pharma", defaultAvgVolume: 1613234, basePrice: 1201.5 },
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
