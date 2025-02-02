import React, { useState } from "react";
import { localize } from "@cometchat/chat-uikit-react";
import "./Styles/CometChatTabs.css";
import { FaRegUser } from "react-icons/fa";
import { MdGroups } from "react-icons/md";
import { MdCall } from "react-icons/md";
import { MdChat } from "react-icons/md";

export const CometChatTabs = (props: {
    onTabClicked?: (tabItem: { name: string; icon?: string | React.JSX.Element; }) => void;
    activeTab?: string;
}) => {

    const {
        onTabClicked = () => { },
        activeTab
    } = props;

    const [hoverTab, setHoverTab] = useState("");

    const tabItems = [
        {
            "name": localize("CHATS"),
            "icon": <MdChat />  //Icon URL here
        },
        {
            "name": localize("CALLS"),
            "icon": <MdCall />  //Icon URL here
        },
        {
            "name": localize("USERS"),
            "icon": <FaRegUser />

        },
        {
            "name": localize("GROUPS"),
            "icon": <MdGroups /> //Icon URL here
        }
    ]

    return (
        <div className="cometchat-tab-component">
            {
                tabItems.map((tabItem) => (
                    <div
                        key={tabItem.name}
                        className="cometchat-tab-component__tab"
                        onClick={() => onTabClicked(tabItem)}
                    >
                        <div
                            className={(activeTab === tabItem.name.toLowerCase() || hoverTab === tabItem.name.toLowerCase()) ? "cometchat-tab-component__tab-text cometchat-tab-component__tab-text-active" : "cometchat-tab-component__tab-text"}
                            onMouseEnter={() => setHoverTab(tabItem.name.toLowerCase())}
                            onMouseLeave={() => setHoverTab("")}
                        >
                            <div className="cometchat-tab-component__tab-icon">
                                {tabItem.icon}</div>
                            {tabItem.name}
                            
                            
                        </div>
                    </div>
                ))
            }
        </div>
    )

}