/* eslint-disable */

import { format } from "d3-format";
import * as React from "react";
import { ChartContext, isDefined, strokeDashTypes } from "@react-financial-charts/core";
import { HoverTextNearMouse } from "./components";
import { getValueFromOverride, isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { EachInteractiveYCoordinate } from "./wrapper";

interface InteractiveYCoordinateProps {
    readonly onChoosePosition: (e: React.MouseEvent, newText: any, moreProps: any) => void;
    readonly onDragComplete: (e: React.MouseEvent, newAlertList: any[], moreProps: any, draggedAlert: any) => void;
    readonly onSelect?: (e: React.MouseEvent, interactives: any[], moreProps: any) => void;
    readonly onDelete?: (e: React.MouseEvent, yCoordinate: any, moreProps: any) => void;
    readonly defaultPriceCoordinate: {
        readonly bgFill: string;
        readonly bgOpacity: number;
        readonly stroke: string;
        readonly strokeDasharray: strokeDashTypes;
        readonly strokeOpacity: number;
        readonly strokeWidth: number;
        readonly textFill: string;
        readonly fontFamily: string;
        readonly fontWeight: string;
        readonly fontStyle: string;
        readonly fontSize: number;
        readonly text: string;
        readonly textBox: {
            readonly height: number;
            readonly left: number;
            readonly padding: {
                left: number;
                right: number;
            };
            readonly closeIcon: {
                padding: {
                    left: number;
                    right: number;
                };
                width: number;
            };
        };
        readonly edge: {
            readonly stroke: string;
            readonly strokeOpacity: number;
            readonly strokeWidth: number;
            readonly fill: string;
            readonly fillOpacity: number;
        };
    };
    readonly hoverText: object;
    readonly yCoordinateList: any[];
    readonly enabled: boolean;
    readonly priceObj: any;
    readonly fillStyleGain: string;
    readonly fillStyleLoss: string;
    readonly onDragCompleteHorizontal: (e: React.MouseEvent, newObj: any, moreProps: any) => void;
    readonly onDragCompleteWhole: (e: React.MouseEvent, newObj: any, moreProps: any) => void;
    readonly onComplete: (e: React.MouseEvent, newObj: any, moreProps: any) => void;
}

interface InteractiveYCoordinateState {
    current?: any;
    override?: any;
    xValueObj?: any;
}

export class InteractiveYCoordinate extends React.Component<InteractiveYCoordinateProps, InteractiveYCoordinateState> {
    public static defaultProps = {
        defaultPriceCoordinate: {
            bgFill: "#FFFFFF",
            bgOpacity: 1,
            stroke: "#6574CD",
            strokeOpacity: 1,
            strokeDasharray: "ShortDash2",
            strokeWidth: 1,
            textFill: "#6574CD",
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
            fontSize: 12,
            fontStyle: "normal",
            fontWeight: "normal",
            text: "Alert",
            textBox: {
                height: 24,
                left: 20,
                padding: { left: 10, right: 5 },
                closeIcon: {
                    padding: { left: 5, right: 8 },
                    width: 8,
                },
            },
            edge: {
                stroke: "#6574CD",
                strokeOpacity: 1,
                strokeWidth: 1,
                fill: "#FFFFFF",
                fillOpacity: 1,
                orient: "right",
                at: "right",
                arrowWidth: 10,
                dx: 0,
                rectWidth: 50,
                rectHeight: 20,
                displayFormat: format(".2f"),
            },
        },
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: 18,
            bgWidth: 175,
            text: "Click and drag the edge circles",
        },
        yCoordinateList: [],
        priceObj: {},
    };

    public static contextType = ChartContext;

    // @ts-ignore
    private getSelectionState: any;
    private saveNodeType: any;
    // @ts-ignore
    private terminate: any;

    public constructor(props: InteractiveYCoordinateProps) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);
        this.getSelectionState = isHoverForInteractiveType("yCoordinateList").bind(this);

        this.state = {
            xValueObj: {},
        };
    }

    public render() {
        const { yCoordinateList, priceObj, fillStyleGain, fillStyleLoss } = this.props;
        const { override, xValueObj } = this.state;

        if (xValueObj?.x1Value && xValueObj?.x2Value) {
            priceObj.x1Value = xValueObj.x1Value;
            priceObj.x2Value = xValueObj.x2Value;
        }

        /*
        if (current) {
            priceObj.x1Value = current.x1Value;
            priceObj.x2Value = current.x2Value;
        }
        */

        return (
            <g>
                {yCoordinateList.map((each, idx) => {
                    const props = each;
                    return (
                        <EachInteractiveYCoordinate
                            key={each.id}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            {...props}
                            selected={each.selected}
                            yValue={getValueFromOverride(override, idx, "yValue", each.yValue)}
                            onDelete={this.handleDelete}
                            onDrag={this.handleDrag}
                            onDragComplete={this.handleDragComplete}
                            edgeInteractiveCursor="react-financial-charts-move-cursor"
                            priceObj={priceObj}
                            fillStyleGain={fillStyleGain}
                            fillStyleLoss={fillStyleLoss}
                            onDragCompleteHorizontal={this.handleDragCompleteHorizontal}
                            onDragHorizontal={this.handleDragHorizontal}
                            onDragCompleteWhole={this.onDragCompleteWhole}
                            onDragWhole={this.onDragWhole}
                        />
                    );
                })}

                {/*
                <MouseLocationIndicator
                    enabled={true}
                    snap={false}
                    r={1}
                    stroke={"#000000"}
                    opacity={1}
                    strokeWidth={0}
                    onMouseDown={this.handleStart}
                    onClick={this.handleEnd}
                    onMouseMove={this.handleDrawRetracement}
                />
                */}
            </g>
        );
    }

    getCoordinates = (xyValObj: any) => {
        const { priceObj } = this.props;
        const { x1, y1, x2, y2 } = xyValObj;
        const dy = y2 - y1;
        const dx = x2 - x1;
        const targetVal = priceObj.targetVal + dy;
        const currentVal = priceObj.currentVal + dy;
        const stopLossVal = priceObj.stopLossVal + dy;
        const x1Val = priceObj.x1Value + dx;
        const x2Val = priceObj.x2Value + dx;

        return {
            x1Val,
            x2Val,
            targetVal,
            currentVal,
            stopLossVal,
        };
    };

    private readonly onDragWhole = (e: React.MouseEvent, xyValObj: any, moreProps: any) => {
        const { x1Val, x2Val, targetVal, currentVal, stopLossVal } = this.getCoordinates(xyValObj);

        this.setState({
            current: {
                x1Value: x1Val,
                x2Value: x2Val,
                currentVal: currentVal,
                targetVal: targetVal,
                stopLossVal: stopLossVal,
            },
        });
    };

    private readonly onDragCompleteWhole = (e: React.MouseEvent, xyValObj: any, moreProps: any) => {
        this.setState(
            {
                current: null,
            },
            () => {
                const { x1Val, x2Val, targetVal, currentVal, stopLossVal } = this.getCoordinates(xyValObj);

                const { onComplete } = this.props;
                if (onComplete !== undefined) {
                    onComplete(
                        e,
                        {
                            x1Value: x1Val,
                            x2Value: x2Val,
                            currentVal: currentVal,
                            targetVal: targetVal,
                            stopLossVal: stopLossVal,
                        },
                        moreProps,
                    );
                }
            },
        );
    };

    /*

    private readonly handleDrawRetracement = (_: React.MouseEvent, xyValue: any) => {
        const { current } = this.state;

        if (isDefined(current) && isDefined(current.x1)) {
            this.mouseMoved = true;
            this.setState({
                current: {
                    ...current,
                    x2: xyValue[0],
                    y2: xyValue[1],
                },
            });
        }
    };


    private readonly handleStart = (e: React.MouseEvent, xyValue: any, moreProps: any) => {
        const { current } = this.state;
        if (isNotDefined(current) || isNotDefined(current.x1)) {
            this.mouseMoved = false;
            this.setState(
                {
                    current: {
                        x1: xyValue[0],
                        y1: xyValue[1],
                        x2: null,
                        y2: null,
                    },
                },
                () => {
                    const { onStart } = this.props;
                    if (onStart !== undefined) {
                        onStart(moreProps);
                    }
                },
            );
        }
    };

    private readonly handleEnd = (e: React.MouseEvent, xyValue: any, moreProps: any) => {
        const { priceObj } = this.props;
        const { current } = this.state;

        if (this.mouseMoved && isDefined(current) && isDefined(current.x1)) {
            const newRetracements = {
                ...current,
                x2: xyValue[0],
                y2: xyValue[1],
                selected: true,
            };

            this.setState(
                {
                    current: null,
                },
                () => {
                    const { onComplete } = this.props;
                    if (onComplete !== undefined) {
                        onComplete(e, newRetracements, moreProps);
                    }
                },
            );
        }
    };

    */

    private readonly handleDelete = (e: React.MouseEvent, index: number | undefined, moreProps: any) => {
        const { onDelete, yCoordinateList } = this.props;
        if (onDelete !== undefined && index !== undefined) {
            onDelete(e, yCoordinateList[index], moreProps);
        }
    };

    private readonly handleDragComplete = (e: React.MouseEvent, moreProps: any) => {
        const { override } = this.state;
        if (isDefined(override)) {
            const { yCoordinateList } = this.props;
            const newAlertList = yCoordinateList.map((each, idx) => {
                const selected = idx === override.index;
                return selected
                    ? {
                          ...each,
                          yValue: override.yValue,
                          selected,
                      }
                    : {
                          ...each,
                          selected,
                      };
            });
            const draggedAlert = newAlertList[override.index];
            this.setState(
                {
                    override: null,
                },
                () => {
                    const { onDragComplete } = this.props;
                    if (onDragComplete !== undefined) {
                        onDragComplete(e, newAlertList, moreProps, draggedAlert);
                    }
                },
            );
        }
    };

    private readonly handleDrag = (_: React.MouseEvent, index: any, yValue: any) => {
        this.setState({
            override: {
                index,
                yValue,
            },
        });
    };

    private readonly handleDragCompleteHorizontal = (e: React.MouseEvent, moreProps: any) => {
        const newObj = this.state.xValueObj;
        this.setState(
            {
                xValueObj: {},
            },
            () => {
                const { onDragCompleteHorizontal } = this.props;
                if (onDragCompleteHorizontal !== undefined) {
                    onDragCompleteHorizontal(e, newObj, moreProps);
                }
            },
        );
    };

    private readonly handleDragHorizontal = (_: React.MouseEvent, xValueObj: any) => {
        this.setState({
            xValueObj,
        });
    };
}
