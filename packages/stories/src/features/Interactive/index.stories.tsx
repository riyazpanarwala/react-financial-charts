import * as React from "react";
import InteractiveY from "./interactiveY";

export default {
    component: InteractiveY,
    title: "Features/interactiveY",
};

export const RiskReward = () => <InteractiveY />;

export const RiskReward2 = () => <InteractiveY isPriceObj />;

export const RiskReward3 = () => <InteractiveY isPriceObj isShortPosition />;
