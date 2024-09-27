import {
  AreaStyleOptions,
  DeepPartial,
  IChartApi,
  MouseEventParams,
  SeriesOptionsCommon,
  Time,
} from "lightweight-charts";
import { useLineChartSeries } from "@/hooks/charting/useLineChartSeries";
import { TailwindColor } from "@/lib/colors";
import { DateValue, SeriesData } from "@/types/data";

export type SeriesType = {
  color: TailwindColor;
  hideLastValueLine?: boolean;
  data: DateValue[];
  onCrosshairMove?: (
    param: MouseEventParams<Time>,
    data: SeriesData | undefined,
  ) => void;
  seriesOptions?: DeepPartial<AreaStyleOptions & SeriesOptionsCommon>;
  enableDefaultTooltip?: boolean;
  legendOptions?: {
    visible: boolean;
    onClick?: () => void;
  };
  name?: string;
};

type SeriesProps = { series: SeriesType; chart: IChartApi | null };

export const Series = (props: SeriesProps) => {
  const { series, chart } = props;
  useLineChartSeries(chart, series);
  return null;
};