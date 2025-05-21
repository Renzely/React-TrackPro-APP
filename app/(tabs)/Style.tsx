import { StyleSheet } from "react-native";
import { Platform } from "react-native";

//LOGIN SCREEN DESIGN

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#333",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    color: "white",
    fontSize: 18,
  },
  title: {
    color: "black",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#68d6f2",
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "black",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#0aafeb",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupButton: {
    marginTop: 15,
  },

  signupText: {
    color: "#1E90FF",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60, // Half of width/height
    alignSelf: "center",
  },

  //INVENTORY STYLE

  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Ensures spacing between title and icon
    backgroundColor: "#0aafeb",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appBarTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#0aafeb",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  //INVENTORY
  containerinventory: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7f9fc",
  },
  appBarInventoryprocess: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0aafeb",
    paddingTop: 25, // For status bar
    paddingBottom: 6,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },

  appBarTitleInventoryprocess: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
  },
  inputinventoryprocess: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  versionBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#e3e8f0",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cfd8e3",
  },
  skuCodeText: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },

  selectedButton: {
    backgroundColor: "#0aafeb",
    borderColor: "#0aafeb",
  },
  btnText: {
    color: "#333",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#0aafeb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skuItem: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 8,
  },

  selectedSkuItem: {
    backgroundColor: "#add8e6", // Light #0aafeb for selected SKU
  },

  skuText: {
    fontSize: 9,
  },

  expandButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
  },

  expandButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },

  skuItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },

  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 80,
  },

  // INVENTORY HISTORY
  refreshButton: {
    padding: 4,
  },

  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 140,
    elevation: 2,
    width: "90%", // <-- Adjust width here
    alignSelf: "center", // <-- Center it nicely
  },
  itemText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },

  tileContainer: {
    backgroundColor: "#fff",
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  tileHeader: {
    fontWeight: "bold",
    fontSize: 11,
    color: "#333",
  },
  tileDetails: {
    marginTop: 8,
  },

  // QTT HISTORY
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff", // fixes the odd background
  },
  containerQTTHistory: {
    padding: 16,
    paddingBottom: 100, // for spacing below scroll content
  },
  titleQTT: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  noHistoryText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDate: {
    fontSize: 14,
    color: "#888",
  },
  cardContent: {
    marginTop: 12,
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    marginTop: 4,
    borderRadius: 8,
  },
  fabQTT: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#0aafeb",
    borderRadius: 30,
    padding: 16,
    elevation: 4,
  },

  // QTT

  containerQTT: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 60,
    backgroundColor: "#fff",
    flex: 1,
  },
  headerQTT: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  labelQTT: {
    marginTop: 20,
    fontWeight: "600",
  },

  pickerWrapperQTT: {
    height: 50,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 6,
    overflow: "hidden", // ensures borderRadius is applied
  },
  pickerQTT: {
    height: 50, // optional
    width: "100%", // make sure it fits the wrapper
    marginBottom: 10,
  },

  questionQTT: {
    fontWeight: "600",
    marginBottom: 5,
    alignSelf: "center",
  },
  buttonGroupQTT: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "center",
  },
  optionButtonQTT: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 5,
    marginRight: 10,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: "center",
  },

  selectedButtonQTTYes: {
    backgroundColor: "#0AAFEB",
    borderColor: "#0AAFEB",
  },
  selectedButtonQTTNo: {
    backgroundColor: "#FF0000",
    borderColor: "#FF0000",
  },
  optionTextQTT: {
    color: "#000",
  },
  iconButton: {
    alignItems: "center",
    marginRight: 10,
  },
  iconLabel: {
    fontSize: 12,
    color: "gray",
  },
  buttonRowQTT: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  //Inventory Next Week
  lockedContainer: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  lockText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  subTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  skuContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  skuTitle: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  picker: {
    height: 40,
    width: "100%",
  },

  //PROFILE

  appBarProfile: {
    height: 60,
    backgroundColor: "#0aafeb",
    justifyContent: "center",
    paddingHorizontal: 20,
    elevation: 5,
    width: "120%",
  },
  appBarProfileTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  Profilecontainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0aafeb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  infoContainer: {
    width: "100%",
    marginTop: 20,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#555",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
  logoutContainer: {
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "stretch", // ensures it fills horizontally
    marginHorizontal: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // ATTENDANCE
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  appBarAttendance: {
    height: 60,
    backgroundColor: "#0aafeb", // valid #0aafeb color
    justifyContent: "center",
    paddingHorizontal: 20, // add padding for spacing
  },

  appBarTitleAttendance: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  containerAttendance: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
  },
  titleAttendance: {
    fontSize: 24,
    marginBottom: 20,
  },
  selfie: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    width: "60%",
  },
  timestamp: {
    fontSize: 18,
    marginVertical: 4,
    color: "Black",
  },
  sectionLabel: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  viewText: {
    marginLeft: 6,
    color: "#0aafeb",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 400,
    marginBottom: 15,
  },
});

export default loginStyles;
