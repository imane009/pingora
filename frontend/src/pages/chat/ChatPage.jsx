import React, { useEffect, useState, useMemo } from "react";
import {
  localize,
  UIKitSettingsBuilder,
  CometChatUIKit,
  CometChatButton,
  CometChatMessageList,
  CometChatMessageComposer, 
  CometChatMessageHeader,
  CometChatIncomingCall,
  CometChatOutgoingCall,
  CometChatGroupMembers, 
} from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat-pro/chat";
import { CometChatSelector } from "./CometChatSelector.tsx";
import { BsInfoSquare } from "react-icons/bs";
import { TiUserAddOutline } from "react-icons/ti";
import { TbDoorExit } from "react-icons/tb";


import './Styles/ChatPage.css';

const ChatPage = () => {
  const [authUser, setAuthUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); 

  const COMETCHAT_CONSTANTS = useMemo(() => ({
    APP_ID: "27015059589d1852",
    REGION: "eu",
    AUTH_KEY: "021a1467fd83406097e51a6b07bb56d72a762188",
  }), []);

  useEffect(() => {
    const initializeCometChat = async () => {
      try {
        const UIKitSettings = new UIKitSettingsBuilder()
          .setAppId(COMETCHAT_CONSTANTS.APP_ID)
          .setRegion(COMETCHAT_CONSTANTS.REGION)
          .setAuthKey(COMETCHAT_CONSTANTS.AUTH_KEY)
          .subscribePresenceForAllUsers()
          .build();

        await CometChatUIKit.init(UIKitSettings);
        const user = await CometChatUIKit.getLoggedinUser();
        setAuthUser(user);
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
      }
    };

    initializeCometChat();
  }, [COMETCHAT_CONSTANTS]);

  const leaveGroup = (groupId) => {
    if (selectedGroup && selectedGroup.owner === authUser.uid) {
      const limit = 100; 
      
      
      let groupMemberRequest = new CometChat.GroupMembersRequestBuilder(groupId)
        .setLimit(limit)
        .build();
  
      
      groupMemberRequest.fetchNext().then(
        (groupMembers) => {
          console.log("Group Member list fetched successfully:", groupMembers);
  
          
          const otherMembers = groupMembers.filter(member => member.uid !== selectedGroup.owner);
  
          if (otherMembers.length > 0) {
            
            const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
            const newOwnerUid = randomMember.uid;
  
           
            CometChat.transferGroupOwnership(groupId, newOwnerUid).then(
              () => {
                console.log("Successfully transferred ownership of the group.");
                
                CometChat.leaveGroup(groupId).then(
                  (response) => {
                    console.log("Vous avez quitté le groupe avec succès:", response);
                    setSelectedGroup(null); 
                    setShowGroupMembers(false); 
                  },
                  (error) => {
                    console.error("Erreur lors de la tentative de quitter le groupe:", error);
                  }
                );
              },
              (error) => {
                console.log("Could not transfer ownership of the group:", error);
              }
            );
          } else {
            console.log("No other members to transfer ownership to.");
          }
        },
        (error) => {
          console.error("Group Member list fetching failed with exception:", error);
        }
      );
    } else {
      CometChat.leaveGroup(groupId).then(
        (response) => {
          console.log("Vous avez quitté le groupe avec succès:", response);
          setSelectedGroup(null); 
          setShowGroupMembers(false); 
        },
        (error) => {
          console.error("Erreur lors de la tentative de quitter le groupe:", error);
        }
      );
    }
  };

  const fetchUsers = async () => {
    try {
      
      const user = await CometChat.getLoggedinUser();
      if (!user) {
        return;
      }
  
      
      const groupMemberRequest = new CometChat.GroupMembersRequestBuilder(selectedGroup.guid)
        .setLimit(30)
        .build();
      
      const groupMembers = await groupMemberRequest.fetchNext();
  
     
      const usersRequest = new CometChat.UsersRequestBuilder()
        .setLimit(30)
        .build();
  
      
      usersRequest.fetchNext().then(
        userList => {
          
          const filteredUsers = userList.filter(
            user => !groupMembers.some(groupMember => groupMember.getUid() === user.getUid())
          );
          setAvailableUsers(filteredUsers); 
        },
        error => {
          console.error("Erreur lors de la récupération des utilisateurs :", error);
        }
      );
    } catch (error) {
      console.error("Error fetching users:", error.message || error);
    }
  };
  

  const showAddMembers = () => {
    setShowAddMembersModal(true);
    fetchUsers(); 
  };
  
  
  const addMembersToGroup = () => {
    if (selectedUsers.length === 0) {
      alert("Veuillez sélectionner au moins un membre !");
      return;
    }
  
   
    const members = selectedUsers.map(
      user => new CometChat.GroupMember(user.getUid(), CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT)
    );
  
   
    CometChat.addMembersToGroup(selectedGroup.guid, members, []).then(
      (response) => {
        console.log("Membres ajoutés avec succès :", response);
        setShowAddMembersModal(false); 
      },
      (error) => {
        console.error("Erreur lors de l'ajout des membres :", error);
      }
    );
  };

  const checkIfUserIsAdmin = async (groupId) => {
    try {
      const groupInfo = await CometChat.getGroup(groupId);
      if (groupInfo && groupInfo.getOwner() === authUser.uid) {
        setIsAdmin(true); // User is an admin
      } else {
        setIsAdmin(false); // User is not an admin
      }
    } catch (error) {
      console.error("Error checking if user is admin:", error);
    }
  };
  
  // Call the check function when the group is selected
  useEffect(() => {
    if (selectedGroup) {
      checkIfUserIsAdmin(selectedGroup.guid); // Check if the logged-in user is an admin for this group
    }
  }, [selectedGroup]);
  
  const getHeaderView = () => {
    return (
        <div className="cometchat-group-members__header">
            <div className="cometchat-group-members__header__title">
                {localize("GROUP_MEMBERS")}
            </div>
            <div className="custom-button-container">
            {isAdmin && (<div className="custom-button-container" title="Add memebers" onClick={() => { showAddMembers() }} >
              <CometChatButton/>
              <TiUserAddOutline className="custom-icon" />
            </div>)}
            {showAddMembersModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Ajouter des membres au groupe : </h3>
          <div className="user-list">
            {availableUsers.map((user) => (
              <div key={user.getUid()} className="user-item">
                <div className="user">
                  <img src={user.getAvatar()} alt={user.getName()} className="user-avatar" />
                  <span>{user.getName()}</span>
                </div>
                <label>
                  <input
                    type="checkbox"
                    value={user.getUid()}
                    onChange={(e) => {
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

          <div className="modal-actions">
            <button className="btn-add" onClick={addMembersToGroup}>Ajouter</button>
            <button className="btn-cancel" onClick={() => setShowAddMembersModal(false)}>Fermer</button>
          </div>
        </div>
      </div>
    )}
            <div className="custom-button-container" title="Leave the group" onClick={() => { leaveGroup(selectedGroup.guid) }} >
              <CometChatButton/>
              <TbDoorExit className="custom-icon red-icon" />
            </div>
            </div>
        </div>
    );
};
  
  return (
    <div className="conversations-with-messages"  style={{ height: "100vh", position: "relative" }}>
      <div className="conversations-wrapper">
        <CometChatSelector 
          onSelectorItemClicked={(activeItem) => {
            console.log("Active Item:", activeItem);

            let item = activeItem;
            if (activeItem?.conversationWith) {
              item = activeItem.conversationWith;
          }
          if (item?.uid !== undefined) {
            console.log("User Selected:", item.uid);
            setSelectedUser(item);
            setSelectedGroup(null);
            setSelectedCall(null);
        } else if (item?.guid !== undefined) {
            console.log("Group Selected:", item.guid);
            setSelectedUser(null);
            setSelectedGroup(item);
            setSelectedCall(null);
        } else if (item?.sessionId !== undefined) {
            console.log("Call Selected:", item.sessionId);
            if (item.receiver.uid !== authUser.uid) {
            if (item.receiverType === "user") {
              setSelectedUser(item.receiver);
              setSelectedGroup(null);
            } else if (item.receiverType === "group") {
              setSelectedUser(null);
              setSelectedGroup(item.receiver);
            }} else if (item.receiver.uid === authUser.uid) {
              if (item.receiverType === "user") {
                setSelectedUser(item.initiator);
                setSelectedGroup(null);
              } else if (item.receiverType === "group") {
                setSelectedUser(null);
                setSelectedGroup(item.initiator);
              }}
        }
          }} 
        />
      </div>

      {selectedUser || selectedGroup || selectedCall ? (
        <div className="messages-wrapper">
          <CometChatMessageHeader 
            user={selectedUser || undefined} 
            group={selectedGroup || undefined} 
            auxiliaryButtonView={
              selectedGroup ? (
                <button 
                  onClick={() => setShowGroupMembers(!showGroupMembers)}
                  style={{ fontSize: '120%'}}
                >
                  {showGroupMembers ? <BsInfoSquare /> : <BsInfoSquare />}
                </button>
              ) : null
            }
          />
          {showGroupMembers && selectedGroup ? (
            <CometChatGroupMembers group={selectedGroup} headerView={getHeaderView()}/>
          ) : (
            <>
              <CometChatMessageList 
                user={selectedUser ? selectedUser : undefined} 
                group={selectedGroup ? selectedGroup : undefined} 
              />
              <CometChatMessageComposer 
                user={selectedUser ? selectedUser : undefined} 
                group={selectedGroup ? selectedGroup : undefined} 
              />
            </>
          )}
        </div>
      ) : (
        <div className="empty-conversation">Select Conversation to start</div>
      )}
      <CometChatIncomingCall disableSoundForCalls={false} />
      <CometChatOutgoingCall disableSoundForCalls={true} />
    </div>
  );
};

export default ChatPage;
