import * as React from "react";
import {
    // getStrokeDasharrayCanvas,
    getMouseCanvas,
    GenericChartComponent,
    strokeDashTypes,
} from "@react-financial-charts/core";

interface MeasurementProps {
    readonly enabled: boolean;
    readonly onBrush: ({ start, end }: any, moreProps: any) => void;
    readonly type?: "1D" | "2D";
    readonly strokeStyle?: string;
    readonly fillStyle?: string;
    readonly interactiveState?: object;
    readonly strokeDashArray?: strokeDashTypes;
    readonly fillOpacity?: number;
    readonly strokeOpacity?: number;
    readonly textFillStyle?: string;
    readonly fillStyleGain?: string;
    readonly fillStyleLoss?: string;
}

interface MeasurementState {
    end?: any;
    rect: any | null;
    selected?: boolean;
    start?: any;
    x1y1?: any;
    difference?: any;
    percentage?: any;
    isComplete?: boolean;
}

export class Measurement extends React.Component<MeasurementProps, MeasurementState> {
    public static defaultProps = {
        type: "2D",
        strokeStyle: "#000000",
        fillStyle: "#3h3h3h",
        strokeDashArray: "ShortDash",
        fillOpacity: 0.3,
        strokeOpacity: 1,
        textFillStyle: "#fff",
        fillStyleGain: "#74e244", // "#00ff00",
        fillStyleLoss: "#e87975", //"#ff0000",
    };

    public constructor(props: MeasurementProps) {
        super(props);

        this.terminate = this.terminate.bind(this);
        this.state = {
            rect: null,
        };
    }

    public terminate() {
        this.setState({
            x1y1: null,
            start: null,
            end: null,
            rect: null,
        });
    }

    public render() {
        const { enabled } = this.props;
        if (!enabled) {
            return null;
        }

        return (
            <GenericChartComponent
                disablePan={enabled}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                onMouseDown={this.handleZoomStart}
                onMouseMove={this.handleDrawSquare}
                onClick={this.handleZoomComplete}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly hexToRGBA = (inputHex: any, opacity: any) => {
        const hex = inputHex.replace("#", "");
        if (inputHex.indexOf("#") > -1 && (hex.length === 3 || hex.length === 6)) {
            const multiplier = hex.length === 3 ? 1 : 2;

            const r = parseInt(hex.substring(0, 1 * multiplier), 16);
            const g = parseInt(hex.substring(1 * multiplier, 2 * multiplier), 16);
            const b = parseInt(hex.substring(2 * multiplier, 3 * multiplier), 16);

            const result = `rgba(${r}, ${g}, ${b}, ${opacity})`;

            return result;
        }
        return inputHex;
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D) => {
        const { rect } = this.state;
        if (rect === null) {
            return;
        }

        const { x, y, height, width } = rect;
        const {
            strokeStyle = Measurement.defaultProps.strokeStyle,
            // strokeDashArray,
            strokeOpacity = Measurement.defaultProps.strokeOpacity,
            fillOpacity = Measurement.defaultProps.fillOpacity,
            textFillStyle = Measurement.defaultProps.textFillStyle,
            fillStyleGain = Measurement.defaultProps.fillStyleGain,
            fillStyleLoss = Measurement.defaultProps.fillStyleLoss,
        } = this.props;

        // const dashArray = getStrokeDasharrayCanvas(strokeDashArray);
        ctx.strokeStyle = this.hexToRGBA(strokeStyle, strokeOpacity);

        if (this.state.difference > 0) {
            ctx.fillStyle = this.hexToRGBA(fillStyleGain, fillOpacity);
        } else {
            ctx.fillStyle = this.hexToRGBA(fillStyleLoss, fillOpacity);
        }

        // ctx.setLineDash(dashArray);
        ctx.beginPath();
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);

        if (this.state.difference) {
            const { end, start } = this.state;
            const barCount = end.item.idx.index - start.item.idx.index;
            ctx.fillStyle = textFillStyle;
            ctx.font = "16px sans serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${this.state.difference} (${this.state.percentage}%)`, x + width / 2, y + height / 2);
            ctx.fillText(`${barCount} bars`, x + width / 2, y + 20 + height / 2);
        }
    };

    private readonly handleZoomStart = (_: React.MouseEvent, moreProps: any) => {
        const {
            mouseXY: [, mouseY],
            currentItem,
            chartConfig: { yScale },
            xAccessor,
            xScale,
        } = moreProps;

        const x1y1 = [xScale(xAccessor(currentItem)), mouseY];

        this.setState({
            selected: true,
            x1y1,
            start: {
                item: currentItem,
                xValue: xAccessor(currentItem),
                yValue: yScale.invert(mouseY),
            },
        });
    };

    private readonly handleDrawSquare = (_: React.MouseEvent, moreProps: any) => {
        if (this.state.x1y1 == null || this.state.isComplete) {
            return;
        }

        const {
            mouseXY: [, mouseY],
            currentItem,
            chartConfig: { yScale },
            xAccessor,
            xScale,
        } = moreProps;

        const [x2, y2] = [xScale(xAccessor(currentItem)), mouseY];

        const {
            x1y1: [x1, y1],
        } = this.state;

        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const height = Math.abs(y2 - y1);
        const width = Math.abs(x2 - x1);

        const difference = yScale.invert(mouseY) - yScale.invert(y1);
        const percentage = (difference * 100) / yScale.invert(y1);

        this.setState({
            selected: true,
            difference: difference.toFixed(2),
            percentage: percentage.toFixed(2),
            end: {
                item: currentItem,
                xValue: xAccessor(currentItem),
                yValue: yScale.invert(mouseY),
            },
            rect: {
                x,
                y,
                height,
                width,
            },
        });
    };

    private readonly handleZoomComplete = (_: React.MouseEvent, moreProps: any) => {
        this.setState(
            (prevState) => ({
                isComplete: !prevState.isComplete,
            }),
            () => {
                if (!this.state.isComplete) {
                    this.terminate();
                }
            },
        );
    };
}
