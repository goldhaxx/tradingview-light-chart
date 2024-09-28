'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ChartOptions, SeriesMarker, ISeriesApi, LineStyle, ColorType, Time } from 'lightweight-charts';
import { useTheme } from 'next-themes';
import { createClient } from '../utils/supabase/client';
import { Button } from '@/components/ui/button';

interface PriceData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface FormattedPriceData extends SeriesMarker<Time> {
  // Add any additional properties if needed
}

const Chart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>();
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const { theme } = useTheme();
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'Candlestick' | 'Line'>('Candlestick');
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1d'>('1m');
  const [dataFetched, setDataFetched] = useState(false);

  const fetchData = async (range: '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1d') => {
    const supabase = createClient();
    try {
      // Fetch all data without time range filtering
      const { data, error } = await supabase
        .from('price_data')
        .select('*')
        .order('time', { ascending: true });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data available in the database.');
      }

      // Transform data to match Lightweight Charts format
      const candles = data.map((item: any) => ({
        time: new Date(item.time).getTime() / 1000 as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      const lines = data.map((item: any) => ({
        time: new Date(item.time).getTime() / 1000 as Time,
        value: item.close,
      }));

      return { candles, lines };
    } catch (error) {
      console.error('Error fetching or processing data:', error);
      throw error;
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const data = await fetchData(timeRange);
        setPriceData(data.candles);
        setDataFetched(true);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load initial data. Please try again.');
      }
    };

    loadInitialData();
  }, []);

  const addSampleData = async () => {
    const supabase = createClient();
    const sampleData = [
      { time: '2024-03-01', open: 100, high: 105, low: 98, close: 103 },
      { time: '2024-03-02', open: 103, high: 108, low: 101, close: 106 },
      { time: '2024-03-03', open: 106, high: 110, low: 104, close: 109 },
    ];

    try {
      const { data, error } = await supabase.from('price_data').insert(sampleData);
      if (error) {
        console.error('Error inserting sample data:', error);
        setError('Failed to add sample data. Please try again.');
      } else {
        console.log('Sample data inserted successfully');
        setError(null);
        // Refetch the data
        const { data: newData, error: fetchError } = await supabase
          .from('price_data')
          .select('*')
          .order('time', { ascending: true });
        if (fetchError) {
          console.error('Error fetching updated data:', fetchError);
        } else {
          setPriceData(newData || []);
        }
      }
    } catch (error) {
      console.error('Unexpected error while adding sample data:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  useEffect(() => {
    if (chartContainerRef.current && priceData.length > 0) {
      console.log('Chart container dimensions:', {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight
      });

      const isDarkMode = theme === 'dark';

      const chartOptions: ChartOptions = {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        overlayPriceScales: {
          mode: 1, // Example value
          invertScale: false,
          alignLabels: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          borderVisible: true,
          borderColor: '#000000',
          entireTextOnly: false,
          ticksVisible: true,
          minimumWidth: 50,
        },
        layout: {
          background: {
            type: ColorType.Solid,
            color: isDarkMode ? '#131722' : '#ffffff'
          },
          textColor: isDarkMode ? '#D9D9D9' : '#191919',
          fontSize: 12,
          fontFamily: 'Trebuchet MS, roboto, ubuntu, sans-serif',
          attributionLogo: false,
        },
        grid: {
          vertLines: { 
            color: isDarkMode ? '#363c4e' : '#E6E6E6', 
            style: LineStyle.Dotted,
            visible: true,
          },
          horzLines: { 
            color: isDarkMode ? '#363c4e' : '#E6E6E6', 
            style: LineStyle.Dotted,
            visible: true,
          },
        },
        rightPriceScale: {
          borderVisible: false,
          borderColor: isDarkMode ? '#2B2B43' : '#2B2B43',
          entireTextOnly: false,
          visible: true,
          ticksVisible: true,
          autoScale: true,
          mode: 0,
          invertScale: false,
          alignLabels: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          minimumWidth: 40,
        },
        timeScale: {
          borderVisible: false,
          borderColor: isDarkMode ? '#2B2B43' : '#2B2B43',
          visible: true,
          timeVisible: true,
          secondsVisible: false,
          ticksVisible: true,
          rightOffset: 0,
          barSpacing: 10,
          minBarSpacing: 1,
          fixLeftEdge: false,
          fixRightEdge: false,
          lockVisibleTimeRangeOnResize: false,
          rightBarStaysOnScroll: true,
          shiftVisibleRangeOnNewBar: true,
          allowShiftVisibleRangeOnWhitespaceReplacement: true,
          uniformDistribution: false,
          minimumHeight: 0,
          allowBoldLabels: false,
        },
        crosshair: {
          mode: 1,  // Add this line to fix the crosshair error
          vertLine: {
            color: isDarkMode ? '#758696' : '#9B7DFF',
            width: 1,
            style: LineStyle.Solid,
            labelBackgroundColor: isDarkMode ? '#4c525e' : '#9B7DFF',
            visible: true,
            labelVisible: true,
          },
          horzLine: {
            color: isDarkMode ? '#758696' : '#9B7DFF',
            width: 1,
            style: LineStyle.Solid,
            labelBackgroundColor: isDarkMode ? '#4c525e' : '#9B7DFF',
            visible: true,
            labelVisible: true,
          },
        },
        localization: {
          locale: 'en-US',
          dateFormat: 'yyyy-MM-dd',
        },
        autoSize: true,
        watermark: {
          visible: false,
          color: 'rgba(0, 0, 0, 0)',
          text: '',
          fontSize: 0,
          fontFamily: 'sans-serif',
          fontStyle: '',
          horzAlign: 'center',
          vertAlign: 'center',
        },
        leftPriceScale: {
          visible: false,
          autoScale: true,
          mode: 0,
          invertScale: false,
          alignLabels: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          borderVisible: false,
          borderColor: isDarkMode ? '#2B2B43' : '#2B2B43',
          entireTextOnly: false,
          ticksVisible: false,
          minimumWidth: 40,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: {
            time: true,
            price: true,
          },
          axisDoubleClickReset: true,
          mouseWheel: true,
          pinch: true,
        },
        kineticScroll: {
          mouse: true,
          touch: true,
        },
        trackingMode: {
          exitMode: 1,
        },
      };

      chartRef.current = createChart(chartContainerRef.current, chartOptions);
      console.log('Chart created:', chartRef.current);

      candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: isDarkMode ? '#26a69a' : '#53B987',
        downColor: isDarkMode ? '#ef5350' : '#EB5757',
        borderVisible: false,
        wickUpColor: isDarkMode ? '#26a69a' : '#53B987',
        wickDownColor: isDarkMode ? '#ef5350' : '#EB5757',
      });
      lineSeriesRef.current = chartRef.current.addLineSeries({
        color: isDarkMode ? '#2962FF' : '#2962FF',
        lineWidth: 2,
      });

      // Set data directly from priceData
      const formattedData = priceData.map(item => ({
        time: new Date(item.time).getTime() / 1000 as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      console.log('Setting candlestick data:', formattedData);
      candlestickSeriesRef.current.setData(formattedData);

      const lineData = priceData.map(item => ({
        time: new Date(item.time).getTime() / 1000 as Time,
        value: item.close,
      }));

      console.log('Setting line data:', lineData);
      lineSeriesRef.current.setData(lineData);

      chartRef.current.timeScale().fitContent();

      // Handle resize
      const handleResize = () => {
        chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth || 0 });
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        chartRef.current?.remove();
      };
    }
  }, [theme, priceData]);

  // Update chart type
  useEffect(() => {
    if (candlestickSeriesRef.current && lineSeriesRef.current) {
      if (chartType === 'Candlestick') {
        candlestickSeriesRef.current.applyOptions({ visible: true });
        lineSeriesRef.current.applyOptions({ visible: false });
      } else {
        candlestickSeriesRef.current.applyOptions({ visible: false });
        lineSeriesRef.current.applyOptions({ visible: true });
      }
    }
  }, [chartType]);

  // Update time range
  useEffect(() => {
    const updateChartData = async () => {
      if (chartRef.current) {
        setError(null); // Clear any previous errors
        try {
          const data = await fetchData(timeRange);
          candlestickSeriesRef.current?.setData(data.candles);
          lineSeriesRef.current?.setData(data.lines);
          chartRef.current?.timeScale().fitContent();
        } catch (error) {
          console.error('Error updating chart data:', error);
          setError(error instanceof Error ? error.message : 'Failed to update chart data. Please try again.');
        }
      }
    };

    updateChartData();
  }, [timeRange]);

  return (
    <div>
      <div className={`p-4 ${theme === 'dark' ? 'bg-[#131722]' : 'bg-white'}`}>
        {/* Chart Type Selector */}
        <div className="mb-4">
          <label className={`mr-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Select Chart Type: </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'Candlestick' | 'Line')}
            className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
          >
            <option value="Candlestick">Candlestick</option>
            <option value="Line">Line</option>
          </select>
        </div>

        {/* Range Switcher */}
        <div className="mb-4">
          <label className={`mr-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Select Time Range: </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1d')}
            className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
          >
            <option value="1m">1 Minute</option>
            <option value="3m">3 Minutes</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="1d">1 Day</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {/* Chart Container */}
        <div 
          ref={chartContainerRef} 
          className={`border ${theme === 'dark' ? 'border-[#363c4e] bg-[#131722]' : 'border-gray-300 bg-white'}`}
          style={{ minHeight: '400px' }} 
        />
      </div>
    </div>
  );
};

// Function to generate random markers
function generateRandomMarkers(data: any, isDarkMode: boolean): FormattedPriceData[] {
  const actions = ['Buy', 'Sell', 'Hold'];
  const colors = isDarkMode ? ['#10B981', '#EF4444', '#F59E0B'] : ['#22C55E', '#DC2626', '#F59E0B'];

  return data.reduce((acc: FormattedPriceData[], point: PriceData, index: number) => {
    if (Math.random() > 0.7) {  // 30% chance of adding a marker
      const actionIndex = Math.floor(Math.random() * actions.length);
      acc.push({
        time: new Date(point.time).getTime() / 1000 as Time,
        position: 'aboveBar',
        color: colors[actionIndex],
        shape: 'arrowDown',
        text: actions[actionIndex]
      });
    }
    return acc;
  }, []);
}

export default Chart;