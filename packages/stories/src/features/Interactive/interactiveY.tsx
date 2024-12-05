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
} from "react-financial-charts";
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
                <Chart id={1} yExtents={this.yExtents}>
                    <XAxis showGridLines />
                    <YAxis showGridLines />
                    <CandlestickSeries />

                    <ClickCallback
                        onClick={(e, moreProps) => {
                            const { mouseXY, chartConfig, xScale } = moreProps;
                            const [mouseX, mouseY] = mouseXY; // Extract the Y-coordinate of the mouse
                            const yValue = chartConfig.yScale.invert(mouseY); // Convert pixel value to data value

                            const percent = 2;
                            const targetValue = yValue + (yValue * 2) / 100;
                            const stopLossValue = yValue - (yValue * 2) / 100;

                            this.setState({
                                longPositionArr: [
                                    ...this.state.longPositionArr,
                                    {
                                        currentVal: yValue,
                                        targetVal: targetValue,
                                        stopLossVal: stopLossValue,
                                        xValue: xScale.invert(mouseX),
                                        percent,
                                        id: Math.random().toString(16).slice(2),
                                    },
                                ],
                            });
                        }}
                    />

                    {this.state.longPositionArr.map((v) => {
                        return (
                            <LongPosition
                                saveInteractiveNode={this.saveInteractiveNode}
                                currentObj={v}
                                key={v.id}
                                onDeleteMain={this.onDelete}
                                isPriceObj={this.props.isPriceObj}
                            />
                        );
                    })}
                </Chart>
            </ChartCanvas>
        );
    }

    private readonly yExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };
}

export default withOHLCData()(withSize({ style: { minHeight: 600 } })(withDeviceRatio()(Annotated)));
