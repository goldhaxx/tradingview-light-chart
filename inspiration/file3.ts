
import React, { useMemo, useState } from "react";
import { PriceGraph } from "@/components/trading/PriceGraph";
import { Container } from "@/components/container/Container";
import {
  isValidChartRange,
  RangeOptions,
  rangeOptionsArray,
} from "@/types/trading";
import {
  filterDataByRange,
  getDateValuesMetadata,
  getRangeOptionsForData,
} from "@/lib/data";
import { Separator } from "@/components/separator/Separator";
import {
  PriceStatus,
  PriceStatusGroup,
} from "@/components/trading/PriceStatus";
import { ChartTimeRangeSelect } from "@/components/trading/ChartTimeRangeSelect";
import { useSelectedConditionalMarket } from "@/stores/trading";
import { twMerge } from "tailwind-merge";
import { useTwapPrices } from "@/hooks/trading/useTwapPrices";
import { useProposalMarketPrices } from "@/hooks/trading/useProposalMarketPrices";
import {
  ConditionalMarketType,
  ProposalWithFullData,
} from "@metadaoproject/futarchy-sdk";
import { useConditionalMarkets } from "@/hooks/useConditionalMarkets";
import { useSpotPrices } from "@/hooks/trading/useSpotPrices";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";

type PriceChartProps = {
  proposal: ProposalWithFullData;
};

export const PriceChart = (props: PriceChartProps) => {
  const { proposal } = props;
  const { data: conditionalMarkets } = useConditionalMarkets(proposal);
  const { passMarket, failMarket } = conditionalMarkets ?? {};
  const passMarketTwap = useTwapPrices(passMarket?.publicKey, {
    startDate: proposal.creationDate,
  });
  const failMarketTwap = useTwapPrices(failMarket?.publicKey, {
    startDate: proposal.creationDate,
  });
  const { data: proposalMarketPricesData, isLoading } = useProposalMarketPrices(
    proposal?.publicKey,
  );
  const { passMarket: passMarketSpotData, failMarket: failMarketSpotData } =
    proposalMarketPricesData ?? {};
  const passMarketSpot = passMarketSpotData ?? [];
  const failMarketSpot = failMarketSpotData ?? [];
  const isProposalEnded =
    dayjs(proposal.endDate).isBefore(dayjs()) || proposal.state !== "Pending";
  const baseTokenSpot = useSpotPrices(
    proposal?.dao.baseToken.publicKey
      ? new PublicKey(proposal.dao.baseToken.publicKey)
      : undefined,
    {
      endDate: proposal.endDate ?? undefined,
      // TODO: Likely want to add some wiggle room
      startDate: proposal.creationDate ?? undefined,
    },
  );

  const [selectedConditionalMarket, setSelectedConditionalMarket] =
    useSelectedConditionalMarket();
  const passSelected = selectedConditionalMarket === "pass";
  const [selectedRange, setSelectedRange] = useState<RangeOptions>(
    isProposalEnded ? "all-time" : "4-hours",
  ); // Default selected range
  const passTwapPriceData = passMarketTwap.data ?? [];
  const failTwapPriceData = failMarketTwap.data ?? [];
  const passSpotPriceData = passMarketSpot.map((d) => d.dateValue) ?? [];
  const failSpotPriceData = failMarketSpot.map((d) => d.dateValue) ?? [];
  const baseSinceProposalCreated =
    baseTokenSpot?.data?.filter((d) =>
      dayjs(d.dateValue.date).isAfter(dayjs(proposal?.creationDate)),
    ) ?? [];

  const handleMarketClick = (conditionalMarketType: ConditionalMarketType) => {
    setSelectedConditionalMarket(conditionalMarketType);
  };

  // Filtered data based on selected range
  const filteredPassTwapPriceData = useMemo(
    () =>
      isProposalEnded
        ? passTwapPriceData
        : filterDataByRange(passTwapPriceData, selectedRange),
    [selectedRange, passTwapPriceData.length],
  );
  const filteredFailTwapPriceData = useMemo(
    () =>
      isProposalEnded
        ? failTwapPriceData
        : filterDataByRange(failTwapPriceData, selectedRange),
    [selectedRange, failTwapPriceData.length],
  );

  // Function to handle range selection
  const handleRangeChange = (range: string) => {
    // Handle range change logic
    if (isValidChartRange(range)) {
      setSelectedRange(range);
    }
  };