/* eslint-disable */

import * as React from "react";
import { drawOnCanvas } from "@react-financial-charts/coordinates/lib/EdgeCoordinateV3";
import { getYCoordinate } from "@react-financial-charts/coordinates/lib/MouseCoordinateY";
import { getMouseCanvas, GenericChartComponent, strokeDashTypes } from "@react-financial-charts/core";

export interface InteractiveYCoordinateCustomProps {
    readonly bgFillStyle: string;
    readonly strokeStyle: string;
    readonly strokeWidth: number;
    readonly strokeDasharray: strokeDashTypes;
    readonly textFill: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fontWeight: number | string;
    readonly fontStyle: string;
    readonly text: string;
    readonly edge: object;
    readonly textBox: {
        readonly closeIcon: any;
        readonly left: number;
        readonly height: number;
        readonly padding: any;
    };
    readonly yValue: number;
    readonly onDragStart?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDrag?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onUnHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly defaultClassName?: string;
    readonly interactiveCursorClass?: string;
    readonly tolerance: number;
    readonly selected: boolean;
    readonly hovering: boolean;
    readonly uniqueId: number;
    readonly priceObj: any;
    readonly fillStyleGain: string;
    readonly fillStyleLoss: string;
    readonly isShortPosition?: boolean;
    readonly onClickWhenHover?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onClickOutside?: (e: React.MouseEvent, moreProps: any) => void;
}

export class InteractiveYCoordinateCustom extends React.Component<InteractiveYCoordinateCustomProps> {
    public static defaultProps = {
        fontWeight: "normal", // standard dev
        strokeWidth: 1,
        tolerance: 4,
        selected: false,
        hovering: false,
        fillStyleGain: "rgba(116, 226, 68, 0.3)",
        fillStyleLoss: "rgba(232, 121, 117, 0.3)",
    };

    private width = 0;

    public render() {
        const { interactiveCursorClass } = this.props;
        const { onHover, onUnHover } = this.props;
        const { onDragStart, onDrag, onDragComplete, onClickWhenHover, onClickOutside } = this.props;

        return (
            <GenericChartComponent
                clip={false}
                isHover={this.isHover}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                interactiveCursorClass={interactiveCursorClass}
                enableDragOnHover
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                onHover={onHover}
                onUnHover={onUnHover}
                onClickWhenHover={onClickWhenHover}
                onClickOutside={onClickOutside}
                drawOn={["mousemove", "mouseleave", "pan", "drag"]}
            />
        );
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const {
            // bgFillStyle,
            textFill,
            fontFamily,
            fontSize,
            fontStyle,
            fontWeight,
            strokeStyle,
            strokeWidth,
            // strokeDasharray,
            text,
            textBox,
            edge,
            selected,
            hovering,
            uniqueId,
            fillStyleGain,
            fillStyleLoss,
            isShortPosition,
        } = this.props;

        const values = this.helper(moreProps);
        if (values == null) {
            return;
        }

        const { x1, x2, y, currentVal, stopLossVal, targetVal } = values;

        ctx.strokeStyle = strokeStyle;

        ctx.beginPath();
        if (selected || hovering) {
            ctx.lineWidth = strokeWidth + 1;
        } else {
            ctx.lineWidth = strokeWidth;
        }
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;

        this.width =
            textBox.padding.left +
            ctx.measureText(text).width +
            textBox.padding.right +
            textBox.closeIcon.padding.left +
            textBox.closeIcon.width +
            textBox.closeIcon.padding.right;

        let newTargetVal = targetVal;
        let newCurrentVal = currentVal;
        let newstopLossVal = stopLossVal;
        if (uniqueId === 10) {
            newTargetVal = y;
        } else if (uniqueId === 11) {
            newCurrentVal = y;
        } else if (uniqueId === 12) {
            newstopLossVal = y;
        }

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = strokeStyle;
        // ctx.lineWidth = 1;
        ctx.stroke();

        // ctx.fillStyle = bgFillStyle;
        // ctx.fillRect(x1, rect.y, this.width, rect.height);
        // ctx.strokeRect(x1, rect.y, this.width, rect.height);

        ctx.fillStyle = textFill;

        ctx.beginPath();
        ctx.fillText(text, x1 + this.width / 2, y - 10);

        // Highlight between stop-loss and target
        if (isShortPosition) {
            ctx.fillStyle = fillStyleLoss;
        } else {
            ctx.fillStyle = fillStyleGain;
        }
        ctx.fillRect(x1, newTargetVal, x2 - x1, newCurrentVal - newTargetVal);

        if (isShortPosition) {
            ctx.fillStyle = fillStyleGain;
        } else {
            ctx.fillStyle = fillStyleLoss;
        }
        ctx.fillRect(x1, newCurrentVal, x2 - x1, newstopLossVal - newCurrentVal);

        const newEdge = {
            ...edge,
            textFill,
            fontFamily,
            fontSize,
        };

        // @ts-ignore
        const yValue = edge.displayFormat(this.props.yValue);
        const yCoord = getYCoordinate(y, yValue, newEdge, moreProps);
        drawOnCanvas(ctx, yCoord);
    };

    private readonly isHover = (moreProps: any) => {
        const { onHover } = this.props;

        if (onHover !== undefined) {
            const values = this.helper(moreProps);
            if (values == null) {
                return false;
            }

            const { x1, x2, y, rect } = values;
            const {
                mouseXY: [mouseX, mouseY],
            } = moreProps;

            if (
                mouseX >= rect.x &&
                mouseX <= rect.x + this.width &&
                mouseY >= rect.y &&
                mouseY <= rect.y + rect.height
            ) {
                return true;
            }
            if (x1 <= mouseX && x2 >= mouseX && Math.abs(mouseY - y) < 4) {
                return true;
            }
        }
        return false;
    };

    private readonly helper = (moreProps: any) => {
        const { yValue, textBox, priceObj } = this.props;

        const {
            chartConfig: { yScale, height, width },
            xScale,
        } = moreProps;

        const y = Math.round(yScale(yValue));

        if (y >= 0 && y <= height) {
            const rect = {
                x: textBox.left,
                y: y - textBox.height / 2,
                height: textBox.height,
            };

            const { currentVal, stopLossVal, targetVal, x1Value, x2Value } = priceObj;

            const x1Val = xScale(x1Value);
            const x2Val = xScale(x2Value);

            const currentV = Math.round(yScale(currentVal));
            const stopLossV = Math.round(yScale(stopLossVal));
            const targetV = Math.round(yScale(targetVal));

            return {
                x1: x1Val,
                x2: x2Val > width && x1Val <= width ? width : x2Val,
                y,
                rect,
                currentVal: currentV <= height ? currentV : height,
                stopLossVal: stopLossV <= height ? stopLossV : height,
                targetVal: targetV <= height ? targetV : height,
            };
        }
    };
}
