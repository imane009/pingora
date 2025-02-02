import React, { useEffect, useState } from "react";
import { Call, Conversation, Group, User, CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatCallLogs, CometChatConversations, CometChatGroups, CometChatButton, localize, CometChatUIKitLoginListener, CometChatUsers } from "@cometchat/chat-uikit-react";
import { CometChatTabs } from "./CometChatTabs.tsx";
import "./Styles/CometChatSelector.css";
import { RiChatNewLine } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";




interface SelectorProps {
    onSelectorItemClicked?: (input: User | Group | Conversation | Call, type: string) => void;
    onHide?: () => void;
    onNewChatClicked?: () => void;
}

export const CometChatSelector = (props: SelectorProps) => {
    const {
        onSelectorItemClicked = () => { },
    } = props;

    const [loggedInUser, setLoggedInUser] = useState<CometChat.User | null>();
    const [activeItem, setActiveItem] = useState<CometChat.Conversation | CometChat.User | CometChat.Group | CometChat.Call | undefined>();
    const [activeTab, setActiveTab] = useState<string>("chats");
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]); 
   
    useEffect(() => {
        let loggedInUsers = CometChatUIKitLoginListener.getLoggedInUser();
        setLoggedInUser(loggedInUsers)
        fetchUsers();
    }, [CometChatUIKitLoginListener?.getLoggedInUser()])
  

  const fetchUsers = async () => {
    try {
        
       
        const user = await CometChat.getLoggedinUser();
        if (!user) {
            return;
        }

        
        const limit = 30;
        const usersRequest = new CometChat.UsersRequestBuilder()
            .setLimit(limit)
            .build();

        
        usersRequest.fetchNext().then(
            userList => {
              setUsers(userList);
            },
            error => {
              console.error("Erreur lors de la récupération des utilisateurs :", error);
            }
          );
    } catch (error) {
        console.error("Error fetching users:", error.message || error);
    }
};




  const createGroupWithMembers = () => {
    if (groupName.trim() === "") {
      alert("Le nom du groupe ne peut pas être vide !");
      return;
    }

    if (selectedUsers.length === 0) {
      alert("Veuillez sélectionner au moins un membre !");
      return;
    }

    
    const GUID = `group-${Date.now()}`;
    const group = new CometChat.Group(GUID, groupName, CometChat.GROUP_TYPE.PUBLIC);

    
    const members = selectedUsers.map(
      user => new CometChat.GroupMember(user.getUid(), CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT)
    );

    

    CometChat.createGroupWithMembers(group, members, []).then(
      response => {
        console.log("Groupe créé avec succès :", response);
        setShowGroupForm(false);
        setGroupName("");
        setSelectedUsers([]);
        
      },
      error => {
        console.error("Erreur lors de la création du groupe :", error);
      }
    );
  };



        const getHeaderViewNewGroup = () => {
            return (
              <div className="conversations__header">
              <div className="conversations__header__title">
              {localize("GROUPS")}
              </div>
                    <div className="custom-button-container" onClick={() => { setShowGroupForm(true) }} >
                        <CometChatButton/>
                        <FaPlus className="custom-icon" />
                    </div>
              </div>
            );
            };


    return (
        <>
            {loggedInUser && <>
                {activeTab == "chats" ? (
                    <CometChatConversations 
                        activeConversation={activeItem instanceof CometChat.Conversation ? activeItem : undefined}
                        onItemClick={(e) => {
                            setActiveItem(e);
                            onSelectorItemClicked(e, "updateSelectedItem");
                        }}
                    />
                ) : activeTab == "calls" ? (
                    <CometChatCallLogs
                        activeCall={activeItem instanceof CometChat.Call ? activeItem : undefined}
                        onItemClick={(e: Call) => {
                            setActiveItem(e);
                            onSelectorItemClicked(e, "updateSelectedItemCall");
                        }}
                    />
                ) : activeTab == "users" ? (
                    <CometChatUsers
                        activeUser={activeItem instanceof CometChat.User ? activeItem : undefined}
                        onItemClick={(e) => {
                            setActiveItem(e);
                            onSelectorItemClicked(e, "updateSelectedItemUser");
                        }}
                    />
                ) : activeTab == "groups" ? (
                    
                    <CometChatGroups
                        activeGroup={activeItem instanceof CometChat.Group ? activeItem : undefined}
                        onItemClick={(e) => {
                            setActiveItem(e);
                            onSelectorItemClicked(e, "updateSelectedItemGroup");
                        }}
                        headerView={getHeaderViewNewGroup()}
                    />
                    
                ) : null}
                
            </>}
            {/* Formulaire de création de groupe */}
      {showGroupForm && (
        <div className="group-form">
          <h3>Créer un groupe</h3>
          <input
            className="group-form-input"
            type="text"
            placeholder="Nom du groupe"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />

          <h4>Sélectionner des utilisateurs :</h4>
          <div className="user-list">
  {users.map(user => (
    <div key={user.getUid()} className="user-item">
      <div className="user">
        <img src={user.getAvatar()} alt={user.getName()} className="user-avatar" />
        <span>{user.getName()}</span>
      </div>
      <label>
        <input
          type="checkbox"
          value={user.getUid()}
          onChange={e => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user]);
            } else {
              setSelectedUsers(selectedUsers.filter(u => u.getUid() !== user.getUid()));
            }
          }}
        />
      </label>
    </div>
  ))}
</div>


          <div className="group-form-buttons">
            <button className="btn-create" onClick={createGroupWithMembers}>Créer</button>
            <button className="btn-cancel" onClick={() => setShowGroupForm(false)}>Annuler</button>
          </div>
        </div>
      )}
            <CometChatTabs activeTab={activeTab} onTabClicked={(item) => {
                setActiveTab(item.name.toLowerCase())
            }} />
        </>
        
    );
}