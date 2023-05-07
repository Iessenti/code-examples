import React from "react";

import { Ripple } from "components/Ripple";

import { generateRandomNumber } from "shared/helpers";

import TypeIllustration from "assets/images/Ill.png";

import "assets/sass/createOrder/orderTypeCard.sass";

import { useDispatch } from "react-redux";
import { OrderUIActionTypes } from "store/types/orderUI";

interface OrderTypeCardInterface {
  color: string;
  width: string;
  textColor: string;
  smallTextColor: string;
  title: string;
  type: string;
  top: string;
  right: string;
  heightImage: string;
  widthImage: string;
  isOrderCreate: boolean;
  amountCategories?: string;
}

type Props = {
  orderType: OrderTypeCardInterface;
};

const OrderTypeCard = ({ orderType }: Props) => {
  const changeActiveStep = (value: number) => ({
    type: OrderUIActionTypes.CHANGE_STEP,
    payload: value,
  });

  const dispatch = useDispatch();

  return (
    <div
      key={generateRandomNumber()}
      className="order-type-card"
      style={{
        backgroundColor: orderType.color,
        width: `${orderType.width}px`,
      }}
      onClick={() => dispatch(changeActiveStep(1))}
      role="presentation"
    >
      <div className="order-type-card__ripple">
        <Ripple />
      </div>
      <span
        className="order-type-card__title"
        style={{ color: orderType.textColor }}
      >
        {orderType.title}
      </span>
      <br />
      <div
        className="order-type-card__type"
        style={{ color: orderType.smallTextColor }}
      >
        {orderType.type}
      </div>
      {orderType.isOrderCreate && orderType.amountCategories && (
        <div className="order-type-card__amount">{orderType.amountCategories}</div>
      )}
      <div
        className="order-type-card__img"
        style={{
          top: orderType.top,
          right: orderType.right,
          height: orderType.heightImage,
          width: orderType.widthImage,
        }}
      >
        <img
          src={TypeIllustration}
          alt="order-illustration"
          style={{
            height: orderType.heightImage,
            width: orderType.widthImage,
          }}
        />
      </div>
    </div>
  );
};

export { OrderTypeCard };
