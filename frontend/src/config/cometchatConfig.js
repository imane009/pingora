import { CometChat } from "@cometchat-pro/chat";

const appID = "27015059589d1852"; // Remplacez par votre App ID
const region = "eu"; // Exemple : "us", "eu"
const authKey = "021a1467fd83406097e51a6b07bb56d72a762188"; // Auth Key pour l'authentification

export const initializeCometChat = async () => {
  try {
    const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();

    await CometChat.init(appID, appSetting);
    console.log("CometChat initialisé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'initialisation de CometChat :", error);
  }
};

export { appID, authKey };
