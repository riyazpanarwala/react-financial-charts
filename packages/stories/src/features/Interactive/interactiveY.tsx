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
    InteractiveYCoordinate,
} from "react-financial-charts";
import { IOHLCData, withOHLCData } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly ratio: number;
    readonly width: number;
}

let interactiveNodes: any = {};

const alert = {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
    text: "Target",
};
const sell = {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
    stroke: "#E3342F",
    textFill: "#E3342F",
    text: "Sell",
    edge: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
        stroke: "#E3342F",
    },
};
const buy = {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
    stroke: "#1F9D55",
    textFill: "#1F9D55",
    text: "Buy",
    edge: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
        stroke: "#1F9D55",
    },
};

class Annotated extends React.Component<ChartProps> {
    public constructor(props: ChartProps) {
        super(props);

        // this.terminate = this.terminate.bind(this);
        this.state = {
            yCoordinateList: [],
        };
    }
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    onStart = () => {
        const yValue = 58;
        const percent = 2;
        const targetValue = yValue + (yValue * 2) / 100;
        const stopLossValue = yValue - (yValue * 2) / 100;

        this.setState({
            yCoordinateList: [
                {
                    ...alert,
                    yValue: this.round2Decimal(targetValue),
                    id: 10,
                    draggable: true,
                    text: `Target: ${this.round2Decimal(targetValue - yValue)} (${percent}%)`,
                },
                {
                    ...buy,
                    yValue: this.round2Decimal(yValue),
                    id: 11,
                    draggable: true,
                    text: `Risk/Reward : 1`,
                },
                {
                    ...sell,
                    yValue: this.round2Decimal(stopLossValue),
                    id: 12,
                    draggable: true,
                    text: `Stop: ${this.round2Decimal(yValue - stopLossValue)} (${percent}%)`,
                },
            ],
        });
    };

    round2Decimal = (value: any): string => {
        return (Math.round(value * 100) / 100).toFixed(2);
    };

    componentDidMount() {
        this.onStart();
    }

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

    onDelete = (e: any, yCoordinate: number, moreProps: any): void => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            yCoordinateList: [],
        });

        // setYClickedValue("");
        // setOriginalAlertList([])
    };

    getCoordinates = (coordinates: any): any => {
        const targetVal = coordinates[0].yValue - coordinates[1].yValue;
        const stopLossVal = coordinates[1].yValue - coordinates[2].yValue;
        coordinates[0].text = `Target: ${this.round2Decimal(targetVal)} (${this.round2Decimal(
            (targetVal * 100) / coordinates[1].yValue,
        )}%)`;
        coordinates[1].text = `Risk/Reward : ${this.round2Decimal(targetVal / stopLossVal)}`;
        coordinates[2].text = `Stop: ${this.round2Decimal(stopLossVal)} (${this.round2Decimal(
            (stopLossVal * 100) / coordinates[1].yValue,
        )}%)`;
        return coordinates;
    };

    onDragComplete = (e: any, yCoordinateList1: any[], moreProps: any, draggedAlert: any): void => {
        const { id: chartId } = moreProps.chartConfig;
        const alertDragged = draggedAlert != null;
        const positionId = draggedAlert.id;

        const { yValue } = draggedAlert;

        const yCoordinateList = this.state.yCoordinateList;

        if (positionId === 10) {
            if (!(yValue < yCoordinateList[1].yValue)) {
                // setEnableInteractiveObject(false)
                // setOriginalAlertList(yCoordinateList)

                this.setState({
                    yCoordinateList: this.getCoordinates(yCoordinateList1),
                });
            }
        } else if (positionId === 11) {
            if (!(yValue > yCoordinateList[0].yValue || yValue < yCoordinateList[2].yValue)) {
                // setEnableInteractiveObject(false)
                // setOriginalAlertList(yCoordinateList)
                this.setState({
                    yCoordinateList: this.getCoordinates(yCoordinateList1),
                });
            }
        } else if (positionId === 12) {
            if (!(yValue > yCoordinateList[1].yValue)) {
                // setEnableInteractiveObject(false)
                // setOriginalAlertList(yCoordinateList)
                this.setState({
                    yCoordinateList: this.getCoordinates(yCoordinateList1),
                });
            }
        }

        /*
    setEnableInteractiveObject(false)
    setOriginalAlertList(yCoordinateList)
    setYCoordinateList(yCoordinateList1)
    setAlertToEdit({
      alert: draggedAlert,
      chartId,
    })
    setShowModal(alertDragged)
    */
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

                    <InteractiveYCoordinate
                        ref={this.saveInteractiveNode("InteractiveYCoordinate", 1)}
                        enabled={true}
                        onDragComplete={this.onDragComplete}
                        onDelete={this.onDelete}
                        yCoordinateList={this.state.yCoordinateList || []}
                        onChoosePosition={() => {}}
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
