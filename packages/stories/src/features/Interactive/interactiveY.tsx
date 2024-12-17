import * as React from "react";
import {
    Annotate,
    ema,
    discontinuousTimeScaleProviderBuilder,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    LabelAnnotation,
    SvgPathAnnotation,
    XAxis,
    YAxis,
    withDeviceRatio,
    withSize,
    isDefined,
    isNotDefined,
    ClickCallback,
    DrawingObjectSelector,
    BarSeries,
} from "react-financial-charts";
import { format } from "d3-format";
import { IOHLCData, withOHLCData } from "../../data";
import LongPosition from "./longPosition";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

let interactiveNodes: any = {};

class Annotated extends React.Component<ChartProps> {
    public constructor(props: ChartProps) {
        super(props);

        this.state = {
            longPositionArr: [],
        };
        // this.terminate = this.terminate.bind(this);
    }
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    saveInteractiveNode = (type: string, chartId: number) => {
        return (node: any) => {
            const key = `${type}_${chartId}`;
            if (isDefined(node) || isNotDefined(interactiveNodes[key])) {
                interactiveNodes = {
                    ...interactiveNodes,
                    [key]: { type, chartId, node },
                };
            }
            return interactiveNodes;
        };
    };

    onDelete = (id: number) => {
        this.setState({
            longPositionArr: this.state.longPositionArr.filter((v) => v.id !== id),
        });
    };

    handleSelection = (e: React.MouseEvent, interactives: any, moreProps: any) => {
        // console.log(interactives);
        // console.log(moreProps);
    };

    onSelected = (isSelected, mainId) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                longPositionArr: prevState.longPositionArr.map((v) => {
                    if (v.id === mainId) {
                        return { ...v, selected: isSelected };
                    }
                    return v;
                }),
            };
        });
    };

    public render() {
        const { data: initialData, height, ratio, width } = this.props;

        const ema12 = ema()
            .id(1)
            .options({ windowSize: 12 })
            .merge((d: any, c: any) => {
                d.ema12 = c;
            })
            .accessor((d: any) => d.ema12);

        const calculatedData = ema12(initialData);

        const { data, xScale, xAccessor, displayXAccessor } = this.xScaleProvider(calculatedData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max];

        const gridHeight = 500;
        const barChartHeight = gridHeight / 5;
        const barChartOrigin = (_: any, h: any) => [0, h - barChartHeight];
        const chartHeight = gridHeight - barChartHeight;

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={this.margin}
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
            >
                <Chart id={1} height={chartHeight} yExtents={this.yExtents}>
                    <XAxis showGridLines />
                    <YAxis showGridLines />
                    <CandlestickSeries />

                    {this.state.longPositionArr.length > 1 ? (
                        ""
                    ) : (
                        <ClickCallback
                            onClick={(e, moreProps) => {
                                const { mouseXY, chartConfig, xScale } = moreProps;
                                const [mouseX, mouseY] = mouseXY; // Extract the Y-coordinate of the mouse
                                const yValue = chartConfig.yScale.invert(mouseY); // Convert pixel value to data value

                                const percent = 2;
                                const targetValue = yValue + (yValue * 2) / 100;
                                const stopLossValue = yValue - (yValue * 2) / 100;
                                const width = 200;

                                this.setState({
                                    longPositionArr: [
                                        ...this.state.longPositionArr,
                                        {
                                            currentVal: yValue,
                                            targetVal: targetValue,
                                            stopLossVal: stopLossValue,
                                            x1Value: xScale.invert(mouseX),
                                            x2Value: xScale.invert(mouseX + width),
                                            percent,
                                            id: Math.random().toString(16).slice(2),
                                            selected: true,
                                        },
                                    ],
                                });
                            }}
                        />
                    )}

                    {this.state.longPositionArr.map((v) => {
                        return (
                            <LongPosition
                                saveInteractiveNode={this.saveInteractiveNode}
                                currentObj={v}
                                key={v.id}
                                onDeleteMain={this.onDelete}
                                isPriceObj={this.props.isPriceObj}
                                isShortPosition={this.props.isShortPosition}
                                onSelected={this.onSelected}
                            />
                        );
                    })}

                    <DrawingObjectSelector
                        enabled
                        getInteractiveNodes={() => interactiveNodes}
                        drawingObjectMap={
                            {
                                // InteractiveYCoordinate: "yCoordinateList",
                            }
                        }
                        onSelect={this.handleSelection}
                    />
                </Chart>

                <Chart
                    id={2}
                    height={barChartHeight}
                    origin={barChartOrigin}
                    yExtents={(d) => {
                        return d.volume;
                    }}
                    padding={{ top: 8, bottom: 4 }}
                >
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        tickLabelFill={"#fff"}
                        tickStrokeStyle={"#fff"}
                        strokeStyle={"#fff"}
                    />
                    <YAxis
                        ticks={4}
                        tickFormat={format(".2s")}
                        tickLabelFill={"#fff"}
                        tickStrokeStyle={"#fff"}
                        strokeStyle={"#fff"}
                    />

                    <BarSeries
                        yAccessor={(d) => d.volume}
                        fillStyle={(d) => (d.close > d.open ? "rgba(116, 226, 68, 1)" : "rgba(232, 121, 117, 1)")}
                    />
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Annotated)));
