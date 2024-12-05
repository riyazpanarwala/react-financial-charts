import React, { useState } from "react";
import { ClickCallback, InteractiveYCoordinate } from "react-financial-charts";

const alert = {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
    text: "Target",
    textFill: "#fff",
    edge: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
        stroke: "#fff",
        fill: "grey",
    },
};
const sell = {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
    stroke: "#E3342F",
    textFill: "#fff",
    text: "Sell",
    edge: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
        stroke: "#000",
        fill: "grey",
    },
};
const buy = {
    ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate,
    stroke: "#1F9D55",
    textFill: "#fff",
    text: "Buy",
    edge: {
        ...InteractiveYCoordinate.defaultProps.defaultPriceCoordinate.edge,
        stroke: "#000",
        fill: "grey",
    },
};

const LongPosition = ({ saveInteractiveNode, currentObj, isPriceObj, onDeleteMain }: any) => {
    const [yCoordinateList, setYCoordinateList] = useState<any>([]);
    const [priceObj, setPriceObj] = useState<any>({});
    // const [enableInteractiveObject, setEnableInteractiveObject] = useState(false)
    // const [alertToEdit, setAlertToEdit] = useState({})
    // const [modal, setShowModal] = useState(false)
    // const [originalAlertList, setOriginalAlertList] = useState([])

    React.useEffect(() => {
        const { currentVal, targetVal, stopLossVal, percent } = currentObj;
        setYCoordinateList([
            {
                ...alert,
                yValue: round2Decimal(targetVal),
                id: 10,
                draggable: true,
                text: `Target: ${round2Decimal(targetVal - currentVal)} (${percent}%)`,
            },
            {
                ...buy,
                yValue: round2Decimal(currentVal),
                id: 11,
                draggable: true,
                text: `Risk/Reward : 1`,
            },
            {
                ...sell,
                yValue: round2Decimal(stopLossVal),
                id: 12,
                draggable: true,
                text: `Stop: ${round2Decimal(currentVal - stopLossVal)} (${percent}%)`,
            },
        ]);
        setPriceObj(currentObj);
    }, []);

    const onDelete = (e: any, yCoordinate: number, moreProps: any): void => {
        e.preventDefault();
        e.stopPropagation();
        setYCoordinateList([]);
        // setOriginalAlertList([])
        if (onDeleteMain) {
            onDeleteMain(priceObj.id);
        }
    };

    const getCoordinates = (coordinates: any): any => {
        const targetVal = coordinates[0].yValue - coordinates[1].yValue;
        const stopLossVal = coordinates[1].yValue - coordinates[2].yValue;
        coordinates[0].text = `Target: ${round2Decimal(targetVal)} (${round2Decimal(
            (targetVal * 100) / coordinates[1].yValue,
        )}%)`;
        coordinates[1].text = `Risk/Reward : ${round2Decimal(targetVal / stopLossVal)}`;
        coordinates[2].text = `Stop: ${round2Decimal(stopLossVal)} (${round2Decimal(
            (stopLossVal * 100) / coordinates[1].yValue,
        )}%)`;
        return coordinates;
    };

    const onDragComplete = (e: any, yCoordinateList1: any[], moreProps: any, draggedAlert: any): void => {
        const { id: chartId } = moreProps.chartConfig;
        const alertDragged = draggedAlert != null;
        const positionId = draggedAlert.id;

        const { yValue } = draggedAlert;

        if (positionId === 10) {
            if (!(yValue < yCoordinateList[1].yValue)) {
                // setEnableInteractiveObject(false)
                // setOriginalAlertList(yCoordinateList)
                setYCoordinateList(getCoordinates(yCoordinateList1));
                setPriceObj((obj) => ({
                    ...obj,
                    currentVal: yCoordinateList1[1].yValue,
                    targetVal: yCoordinateList1[0].yValue,
                    stopLossVal: yCoordinateList1[2].yValue,
                }));
            }
        } else if (positionId === 11) {
            if (!(yValue > yCoordinateList[0].yValue || yValue < yCoordinateList[2].yValue)) {
                // setEnableInteractiveObject(false)
                // setOriginalAlertList(yCoordinateList)
                setYCoordinateList(getCoordinates(yCoordinateList1));

                setPriceObj((obj) => ({
                    ...obj,
                    currentVal: yCoordinateList1[1].yValue,
                    targetVal: yCoordinateList1[0].yValue,
                    stopLossVal: yCoordinateList1[2].yValue,
                }));
            }
        } else if (positionId === 12) {
            if (!(yValue > yCoordinateList[1].yValue)) {
                // setEnableInteractiveObject(false)
                // setOriginalAlertList(yCoordinateList)
                setYCoordinateList(getCoordinates(yCoordinateList1));
                setPriceObj((obj) => ({
                    ...obj,
                    currentVal: yCoordinateList1[1].yValue,
                    targetVal: yCoordinateList1[0].yValue,
                    stopLossVal: yCoordinateList1[2].yValue,
                }));
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

    const round2Decimal = (value: any): string => {
        return (Math.round(value * 100) / 100).toFixed(2);
    };

    return (
        <InteractiveYCoordinate
            ref={saveInteractiveNode("InteractiveYCoordinate", priceObj.id)}
            enabled={true}
            onDragComplete={onDragComplete}
            onDelete={onDelete}
            yCoordinateList={yCoordinateList}
            onChoosePosition={() => {}}
            priceObj={isPriceObj ? priceObj : ""}
        />
    );
};

export default LongPosition;
