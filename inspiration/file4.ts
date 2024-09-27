"use client";

import { DateValue } from "@/types/data";
import { useRef } from "react";
import {
  AreaData,
  AreaSeriesOptions,
  AreaStyleOptions,
  DeepPartial,
  ISeriesApi,
  SeriesOptionsCommon,
  Time,
  TimeChartOptions,
  UTCTimestamp,
  WhitespaceData,
} from "lightweight-charts";
import { useCreateChartInstance } from "../../hooks/charting/useCreateChartInstance";
import { Series, SeriesType } from "./Series";
import { RangeOptions } from "@/types/trading";

type LineChartProps = {
  seriesArray: SeriesType[];
  options?: DeepPartial<TimeChartOptions>;
  fadeSides?: {
    left: boolean;
    right: boolean;
  };
  visibleRangeSelection?: RangeOptions;
};

/**
 * convertSeriesDataForChart - on each date this function calculates a UTC timestamp
 * via division by 1000 for the chart library
 * @param data an array of DateValue objects which include a number(value) and a js Date object (date).
 * @returns an array of objects where the date is convereted to a utc timestamp and under a "time" property
 */
export const convertSeriesDataForChart = (data: DateValue[]) => {
  return data
    .map(({ date, value }) => ({
      time: (date.getTime() / 1000) as UTCTimestamp,
      value,
    }))
    .filter((d) => !!d.value);
};

export const LineChart = (props: LineChartProps) => {
  const { seriesArray, options, fadeSides, visibleRangeSelection } = props;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartAPI] = useCreateChartInstance(
    chartContainerRef,
    seriesArray,
    options,
    fadeSides,
    visibleRangeSelection,
  );

  return (
    <div className="w-full" ref={chartContainerRef}>
      {seriesArray.map((s, i) => (
        <Series key={`series-${i}`} series={s} chart={chartAPI} />
      ))}
    </div>
  );
};

export type AreaSeriesApiType = ISeriesApi<
  "Area",
  Time,
  AreaData<Time> | WhitespaceData<Time>,
  AreaSeriesOptions,
  DeepPartial<AreaStyleOptions & SeriesOptionsCommon>
>;