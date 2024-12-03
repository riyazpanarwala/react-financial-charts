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
    RangeProfileSeries,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

let interactiveNodes: any = {};

class Annotated extends React.Component<ChartProps> {
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

        const dateRangeArr = [{ startDate: "2016-08-25", endDate: "2016-09-27" }];

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

                    {dateRangeArr.map((v, i) => {
                        const { startDate, endDate } = v;
                        return (
                            <RangeProfileSeries
                                bySession
                                // origin="top"
                                showSessionBackground
                                sessionStart={({ d, i, plotData }) => {
                                    // console.log(plotData[i - 1].date, d.date)
                                    const timeStamp = new Date(d.date).getTime();
                                    const startDateTime = new Date(startDate).getTime();
                                    const endDateTime = new Date(endDate).getTime();
                                    const aa = timeStamp >= startDateTime;
                                    const bb = timeStamp <= endDateTime;

                                    return !(aa && bb);
                                }}
                                volume={(d) => 0}
                                key={i}
                                sessionBackGround="rgba(70, 70, 70, 0.3)"
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
