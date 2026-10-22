//+------------------------------------------------------------------+
//|                                     BodyFailComposition_v2.mq5   |
//|  Pi-Nexsus / PiRC algorithmic trading module                     |
//|  Candle body/wick decomposition + body-failure signal detection  |
//|  v2: adds full "composition" breakdown (body_ratio, wick ratios, |
//|      body_type classification) on top of BodyFail v1 events.     |
//+------------------------------------------------------------------+
#property copyright "Tsukimarf / Pi-Nexsus"
#property version   "2.00"
#property indicator_chart_window
#property indicator_buffers 3
#property indicator_plots   3

#property indicator_label1  "BodyFailTrigger"
#property indicator_type1   DRAW_ARROW
#property indicator_color1  clrOrangeRed
#property indicator_width1  2

#property indicator_label2  "BodyRatio"
#property indicator_type2   DRAW_NONE

#property indicator_label3  "BodyType"
#property indicator_type3   DRAW_NONE

//--- input parameters (mirrors classification_thresholds in the JSON config)
input double InpDojiMaxBodyRatio        = 0.10;
input double InpMarubozuMinBodyRatio    = 0.85;
input double InpSmallWickMaxRatio       = 0.10;
input double InpLongWickMinRatio        = 0.60;
input double InpSmallBodyMaxRatio       = 0.30;
input double InpMinTriggerBodyRatio     = 0.70;
input double InpMinRetracementRatio     = 0.50;
input bool   InpExportCSV               = true;
input string InpExportFileName          = "bodyfail_compositions_v2.csv";

//--- buffers
double BufTriggerArrow[];
double BufBodyRatio[];
double BufBodyType[];   // numeric code, see BodyTypeCode()

//--- body type numeric codes (kept in sync with SQL CHECK / JSON enum)
#define BT_DOJI            0
#define BT_MARUBOZU        1
#define BT_HAMMER          2
#define BT_HANGING_MAN     3
#define BT_SHOOTING_STAR   4
#define BT_INVERTED_HAMMER 5
#define BT_SPINNING_TOP    6
#define BT_NORMAL          7
#define BT_FLAT            8

int    fileHandle = INVALID_HANDLE;

//+------------------------------------------------------------------+
int OnInit()
  {
   SetIndexBuffer(0, BufTriggerArrow, INDICATOR_DATA);
   SetIndexBuffer(1, BufBodyRatio,    INDICATOR_CALCULATIONS);
   SetIndexBuffer(2, BufBodyType,     INDICATOR_CALCULATIONS);

   PlotIndexSetInteger(0, PLOT_ARROW, 174); // up/down triangle glyph
   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, EMPTY_VALUE);

   if(InpExportCSV)
     {
      fileHandle = FileOpen(InpExportFileName, FILE_WRITE | FILE_CSV | FILE_ANSI, ',');
      if(fileHandle != INVALID_HANDLE)
        {
         FileWrite(fileHandle,
            "symbol","timeframe","candle_time","open","high","low","close","volume",
            "range_size","body_size","body_ratio","upper_wick","upper_wick_ratio",
            "lower_wick","lower_wick_ratio","direction","body_type","is_bodyfail_trigger");
        }
      else
         Print("BodyFailComposition_v2: failed to open export file, error ", GetLastError());
     }

   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   if(fileHandle != INVALID_HANDLE)
      FileClose(fileHandle);
  }

//+------------------------------------------------------------------+
//| Classify body type from ratios — mirrors body_type_rules in JSON |
//+------------------------------------------------------------------+
int BodyTypeCode(double bodyRatio, double upperWickRatio, double lowerWickRatio,
                  bool isBullish, double rangeSize)
  {
   if(rangeSize <= 0.0)
      return BT_FLAT;
   if(bodyRatio < InpDojiMaxBodyRatio)
      return BT_DOJI;
   if(bodyRatio > InpMarubozuMinBodyRatio)
      return BT_MARUBOZU;
   if(isBullish && lowerWickRatio > InpLongWickMinRatio &&
      bodyRatio < InpSmallBodyMaxRatio && upperWickRatio < InpSmallWickMaxRatio)
      return BT_HAMMER;
   if(!isBullish && lowerWickRatio > InpLongWickMinRatio &&
      bodyRatio < InpSmallBodyMaxRatio && upperWickRatio < InpSmallWickMaxRatio)
      return BT_HANGING_MAN;
   if(isBullish && upperWickRatio > InpLongWickMinRatio &&
      bodyRatio < InpSmallBodyMaxRatio && lowerWickRatio < InpSmallWickMaxRatio)
      return BT_SHOOTING_STAR;
   if(!isBullish && upperWickRatio > InpLongWickMinRatio &&
      bodyRatio < InpSmallBodyMaxRatio && lowerWickRatio < InpSmallWickMaxRatio)
      return BT_INVERTED_HAMMER;
   if(bodyRatio < InpSmallBodyMaxRatio)
      return BT_SPINNING_TOP;
   return BT_NORMAL;
  }

string BodyTypeName(int code)
  {
   switch(code)
     {
      case BT_DOJI:            return "doji";
      case BT_MARUBOZU:        return "marubozu";
      case BT_HAMMER:          return "hammer";
      case BT_HANGING_MAN:     return "hanging_man";
      case BT_SHOOTING_STAR:   return "shooting_star";
      case BT_INVERTED_HAMMER: return "inverted_hammer";
      case BT_SPINNING_TOP:    return "spinning_top";
      case BT_FLAT:            return "flat";
      default:                 return "normal";
     }
  }

//+------------------------------------------------------------------+
//| Main calculation                                                  |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                 const int prev_calculated,
                 const datetime &time[],
                 const double &open[],
                 const double &high[],
                 const double &low[],
                 const double &close[],
                 const long &tick_volume[],
                 const long &volume[],
                 const int &spread[])
  {
   int start = (prev_calculated > 1) ? prev_calculated - 1 : 1;

   for(int i = start; i < rates_total; i++)
     {
      double rangeSize = high[i] - low[i];
      double bodySize  = MathAbs(close[i] - open[i]);
      bool   isBullish = (close[i] >= open[i]);

      double bodyRatio       = (rangeSize > 0) ? bodySize / rangeSize : 0.0;
      double upperWick       = high[i] - MathMax(open[i], close[i]);
      double lowerWick       = MathMin(open[i], close[i]) - low[i];
      double upperWickRatio  = (rangeSize > 0) ? upperWick / rangeSize : 0.0;
      double lowerWickRatio  = (rangeSize > 0) ? lowerWick / rangeSize : 0.0;

      int bodyType = BodyTypeCode(bodyRatio, upperWickRatio, lowerWickRatio, isBullish, rangeSize);

      BufBodyRatio[i] = bodyRatio;
      BufBodyType[i]  = (double)bodyType;

      //--- body-fail trigger: strong body candle (marubozu-strength) whose
      //    direction is later reversed beyond InpMinRetracementRatio.
      bool isTrigger = (bodyRatio >= InpMinTriggerBodyRatio);
      BufTriggerArrow[i] = isTrigger ? (isBullish ? low[i] - 5 * _Point : high[i] + 5 * _Point)
                                      : EMPTY_VALUE;

      //--- confirm reversal against the previous trigger, one bar later
      if(i > 0 && BufTriggerArrow[i - 1] != EMPTY_VALUE)
        {
         double prevBodySize = MathAbs(close[i - 1] - open[i - 1]);
         bool   prevBullish  = (close[i - 1] >= open[i - 1]);
         double retracement  = (prevBodySize > 0) ? MathAbs(close[i] - close[i - 1]) / prevBodySize : 0.0;
         bool   reversed     = (prevBullish && close[i] < close[i - 1]) ||
                                (!prevBullish && close[i] > close[i - 1]);

         if(reversed && retracement >= InpMinRetracementRatio)
           {
            double confidence = MathMin(1.0, BufBodyRatio[i - 1] * 0.6 + 0.4);
            PrintFormat("BodyFail event: %s trigger=%s confirm=%s dir_failed=%s retr=%.4f conf=%.4f",
                        _Symbol, TimeToString(time[i - 1]), TimeToString(time[i]),
                        prevBullish ? "bullish" : "bearish", retracement, confidence);
           }
        }

      if(InpExportCSV && fileHandle != INVALID_HANDLE)
        {
         FileWrite(fileHandle,
            _Symbol, EnumToString((ENUM_TIMEFRAMES)Period()), TimeToString(time[i], TIME_DATE | TIME_SECONDS),
            DoubleToString(open[i], _Digits), DoubleToString(high[i], _Digits),
            DoubleToString(low[i], _Digits), DoubleToString(close[i], _Digits),
            (long)tick_volume[i],
            DoubleToString(rangeSize, _Digits), DoubleToString(bodySize, _Digits),
            DoubleToString(bodyRatio, 5), DoubleToString(upperWick, _Digits),
            DoubleToString(upperWickRatio, 5), DoubleToString(lowerWick, _Digits),
            DoubleToString(lowerWickRatio, 5), isBullish ? "bullish" : "bearish",
            BodyTypeName(bodyType), isTrigger ? "true" : "false");
        }
     }

   return(rates_total);
  }
//+------------------------------------------------------------------+
