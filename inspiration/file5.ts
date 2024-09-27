const filteredPassSpotPriceData = useMemo(
    () =>
      isProposalEnded
        ? passSpotPriceData
        : filterDataByRange(passSpotPriceData, selectedRange),
    [selectedRange, passSpotPriceData.length],
  );
  const filteredFailSpotPriceData = useMemo(
    () =>
      isProposalEnded
        ? failSpotPriceData
        : filterDataByRange(failSpotPriceData, selectedRange),
    [selectedRange, failSpotPriceData.length],
  );

  const passTwapPriceMetadata = useMemo(() => {
    return getDateValuesMetadata(filteredPassTwapPriceData);
  }, [filteredPassTwapPriceData]);
  const failTwapPriceMetadata = useMemo(() => {
    return getDateValuesMetadata(filteredFailTwapPriceData);
  }, [filteredFailTwapPriceData]);
  const passSpotPriceMetadata = useMemo(() => {
    return getDateValuesMetadata(filteredPassSpotPriceData);
  }, [passSpotPriceData]);
  const failSpotPriceMetadata = useMemo(() => {
    return getDateValuesMetadata(filteredFailSpotPriceData);
  }, [failSpotPriceData]);

  const baseTokenSpotPriceData = useMemo(
    () =>
      baseSinceProposalCreated
        ?.map((d) => d.dateValue)
        .filter(
          (d) =>
            d.date <= failSpotPriceMetadata.latestValue.date &&
            d.date <= passSpotPriceMetadata.latestValue.date,
        ) ?? [],
    [
      baseSinceProposalCreated?.length,
      failSpotPriceMetadata.latestValue.date.toISOString(),
      passSpotPriceMetadata.latestValue.date.toISOString(),
    ],
  );

  const filteredBaseSpotPriceData = useMemo(
    () =>
      isProposalEnded
        ? baseTokenSpotPriceData
        : filterDataByRange(baseTokenSpotPriceData, selectedRange),
    [selectedRange, baseTokenSpotPriceData.length],
  );

  const disabledRangeOptions = useMemo<RangeOptions[]>(() => {
    const enabledOptions = Array.from(
      new Set([
        ...getRangeOptionsForData(passSpotPriceData),
        ...getRangeOptionsForData(failSpotPriceData),
      ]),
    ).concat("all-time");

    return rangeOptionsArray.filter(
      (o): o is RangeOptions => !enabledOptions.includes(o as RangeOptions),
    );
  }, [failSpotPriceData, passSpotPriceData]);