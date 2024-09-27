import React from "react";
import { DateValue } from "@/types/data";
import { LineChart } from "@/components/charts/LineChart";
import { SeriesType } from "@/components/charts/Series";
import { useSelectedConditionalMarket } from "@/stores/trading";
import { RangeOptions } from "@/types/trading";

type PriceGraphProps = {
  spotPriceData: DateValue[];
  passTwapPriceData: DateValue[];
  failTwapPriceData: DateValue[];
  passSpotPriceData: DateValue[];
  failSpotPriceData: DateValue[];
  visibleRangeSelection: RangeOptions;
};

export const PriceGraph = (props: PriceGraphProps) => {
  const {
    spotPriceData,
    passTwapPriceData,
    failTwapPriceData,
    passSpotPriceData,
    failSpotPriceData,
    visibleRangeSelection,
  } = props;
  const [selectedConditionalMarket, setSelectedConditionalMarket] =
    useSelectedConditionalMarket();
  const passSelected = selectedConditionalMarket === "pass";
  const seriesArray: SeriesType[] = [
    //TODO: don't we have pass and fail spot price? What colors should we use?
    {
      data: spotPriceData,
      color: "primary-100",
      legendOptions: {
        visible: true,
      },
      name: "Token Spot Price",
    },
    {
      data: passTwapPriceData,
      color: passSelected ? "emerald-600" : "emerald-100",
    },
    {
      data: failTwapPriceData,
      color: passSelected ? "pink-100" : "pink-600",
    },
    {
      data: passSpotPriceData,
      color: passSelected ? "emerald-600" : "emerald-200",
      enableDefaultTooltip: passSelected,
      seriesOptions: {
        lineWidth: 2,
      },
      legendOptions: {
        visible: true,
        onClick: () => setSelectedConditionalMarket("pass"),
      },
      name: "Pass Market Price",
    },
    {
      data: failSpotPriceData,
      color: passSelected ? "pink-200" : "pink-600",
      enableDefaultTooltip: !passSelected,
      seriesOptions: {
        lineWidth: 2,
      },
      legendOptions: {
        visible: true,
        onClick: () => setSelectedConditionalMarket("fail"),
      },
      name: "Fail Market Price",
    },
  ];

  return (
    <div className="space-y-2 bg-primary-900 pb-12">
      <LineChart
        visibleRangeSelection={visibleRangeSelection}
        seriesArray={seriesArray}
      />
    </div>
  );
};