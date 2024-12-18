import * as React from "react";
import {
    getStrokeDasharrayCanvas,
    getMouseCanvas,
    GenericChartComponent,
    strokeDashTypes,
} from "@riyazpanarwala/core";

interface BrushProps {
    readonly enabled: boolean;
    readonly onBrush: ({ start, end }: any, moreProps: any) => void;
    readonly type?: "1D" | "2D";
    readonly strokeStyle?: string;
    readonly fillStyle?: string;
    readonly interactiveState: object;
    readonly strokeDashArray?: strokeDashTypes;
    readonly fillOpacity?: number;
    readonly strokeOpacity?: number;
}

interface BrushState {
    end?: any;
    rect: any | null;
    selected?: boolean;
    start?: any;
    x1y1?: any;
}

export class Brush extends React.Component<BrushProps, BrushState> {
    public static defaultProps = {
        type: "2D",
        strokeStyle: "#000000",
        fillStyle: "#3h3h3h",
        strokeDashArray: "ShortDash",
        fillOpacity: 0.3,
        strokeOpacity: 1,
    };

    private zoomHappening?: boolean;

    public constructor(props: BrushProps) {
        super(props);

        this.terminate = this.terminate.bind(this);
        this.state = {
            rect: null,
        };
    }

    public terminate() {
        this.zoomHappening = false;
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
            strokeStyle = Brush.defaultProps.strokeStyle,
            fillStyle = Brush.defaultProps.fillStyle,
            strokeDashArray,
            strokeOpacity = Brush.defaultProps.strokeOpacity,
            fillOpacity = Brush.defaultProps.fillOpacity,
        } = this.props;

        const dashArray = getStrokeDasharrayCanvas(strokeDashArray);
        ctx.strokeStyle = this.hexToRGBA(strokeStyle, strokeOpacity);
        ctx.fillStyle = this.hexToRGBA(fillStyle, fillOpacity);
        ctx.setLineDash(dashArray);
        ctx.beginPath();
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
    };

    private readonly handleZoomStart = (_: React.MouseEvent, moreProps: any) => {
        this.zoomHappening = false;
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
        if (this.state.x1y1 == null) {
            return;
        }

        this.zoomHappening = true;

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

        this.setState({
            selected: true,
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
        if (this.zoomHappening) {
            const { onBrush } = this.props;
            if (onBrush !== undefined) {
                const { start, end } = this.state;
                onBrush({ start, end }, moreProps);
            }
        }

        this.setState({
            selected: false,
            rect: null,
        });
    };
}
