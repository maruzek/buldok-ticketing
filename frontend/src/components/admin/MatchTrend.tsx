import { Diff, TrendingDown, TrendingUp } from "lucide-react";

const MatchTrend = ({
  seasonStat,
  matchStat,
}: {
  seasonStat: number;
  matchStat: number;
}) => {
  if (!seasonStat || !matchStat) {
    console.log(seasonStat, matchStat);
    return null;
  }

  const trendDiff = ((matchStat - seasonStat) / seasonStat) * 100;

  if (trendDiff > 0) {
    return (
      <span
        className="text-green-500 font-semibold flex items-center gap-1 text-sm"
        title="Nárůst oproti průměru sezóny"
      >
        <TrendingUp size={16} /> +{trendDiff.toFixed(2)}%
      </span>
    );
  } else if (trendDiff === 0) {
    return (
      <span className="text-yellow-500 font-semibold flex items-center gap-1  text-sm">
        <Diff size={16} /> 0
      </span>
    );
  } else {
    return (
      <span className="text-red-500 font-semibold flex items-center gap-1 text-sm">
        <TrendingDown size={16} /> -{Math.abs(trendDiff).toFixed(2)}%
      </span>
    );
  }
};

export default MatchTrend;
