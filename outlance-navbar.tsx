import { React, useState, ReactNode } from "react";
import { useDispatch } from "react-redux";
import { Link, useRouteMatch } from "react-router-dom";

import { StepTabs } from "components/StepTabs";
import {
  LogoIcon,
  ChatIcon,
  BellIcon,
  ProfileIcon,
  CircleIndicator,
} from "shared/icons";

import { routes } from "routes";
import { PopupProfileActionTypes } from "store/types/popupProfile";
import { PopupNotificationsActionTypes } from "store/types/popupNotifications";

import "assets/sass/navbar.sass";

const Navbar = (): ReactNode => {
  const handleProfilePopupAction = (value: boolean) => ({
    type: PopupProfileActionTypes.PROFILE_POPUP,
    payload: value,
  });
  const setTimeoutProfilePopupAction = (value: number | null) => ({
    type: PopupProfileActionTypes.SET_PROFILE_POPUP_TIMEOUT,
    payload: value,
  });

  const handleNotificationsPopupAction = (value: boolean) => ({
    type: PopupNotificationsActionTypes.NOTIFICATIONS_POPUP,
    payload: value,
  });
  const setTimeoutNotificationsPopupAction = (value: number | null) => ({
    type: PopupNotificationsActionTypes.SET_NOTIFICATIONS_POPUP_TIMEOUT,
    payload: value,
  });

  const [iconHover, setIconHover] = useState({
    chat: "#13131C",
    bell: "#13131C",
  });

  const dispatch = useDispatch();

  const isOrderCreatingPage = useRouteMatch(routes.orderCreate);

  return (
    <header className="navbar">
      <div className="container">
        <div className="logo">
          <LogoIcon />
        </div>

        {isOrderCreatingPage ? <StepTabs /> : false}

        <div className="navbar--info info">
          {isOrderCreatingPage ? (
            false
          ) : (
            <>
              <Link className="info__make-order" to={routes.main}>
                Создать заказ
              </Link>
              <div className="info__divider" />
            </>
          )}
          <div
            className="info__icon-container chat"
            onMouseEnter={() => setIconHover({ ...iconHover, chat: "#464650" })}
            onMouseLeave={() => setIconHover({ ...iconHover, chat: "#13131C" })}
          >
            <div className="info__icon-container__icon">
              <ChatIcon iconProperty={iconHover.chat} />
            </div>
            <div className="indicator">
              <span>
                <CircleIndicator />
              </span>
            </div>
          </div>
          <div
            className="info__icon-container"
            onMouseEnter={() => {
              setIconHover({ ...iconHover, bell: "#464650" });
              dispatch(handleNotificationsPopupAction(true));
            }}
            onMouseLeave={() => {
              setIconHover({ ...iconHover, bell: "#13131C" });
              const timeoutNotifications = window.setTimeout(() => {
                dispatch(handleNotificationsPopupAction(false));
              });
              dispatch(
                setTimeoutNotificationsPopupAction(timeoutNotifications)
              );
            }}
          >
            <div className="info__icon-container__icon">
              <BellIcon iconProperty={iconHover.bell} />
            </div>
            <div className="indicator">
              <span>
                <CircleIndicator />
              </span>
            </div>
          </div>

          <div
            className="info__icon-container"
            onMouseOver={() => dispatch(handleProfilePopupAction(true))}
            onMouseLeave={() => {
              const timeout = window.setTimeout(() => {
                dispatch(handleProfilePopupAction(false));
              }, 1000);
              dispatch(setTimeoutProfilePopupAction(timeout));
            }}
          >
            <ProfileIcon />
          </div>
        </div>
      </div>
    </header>
  );
};

export { Navbar };
