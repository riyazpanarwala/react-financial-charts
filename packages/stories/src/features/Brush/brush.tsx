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
    Brush,
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

    handleBrush1 = (brushCoords: any, moreProps: any): void => {
        const { start, end } = brushCoords;
        const left = Math.min(start.xValue, end.xValue);
        const right = Math.max(start.xValue, end.xValue);

        const low = Math.min(start.yValue, end.yValue);
        const high = Math.max(start.yValue, end.yValue);

        // setxExtents([left, right]);
        // setyExtents([low, high]);
        // setBrushEnabled(false);
    };

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

                    <Brush
                        ref={this.saveInteractiveNode("Brush", 1)}
                        enabled={true}
                        type={"2D"}
                        onBrush={this.handleBrush1}
                        fillStyle="red"
                        fillOpacity={0.1}
                        interactiveState={{}}
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
