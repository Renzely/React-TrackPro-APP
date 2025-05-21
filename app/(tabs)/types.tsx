import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Navigator: undefined;
  Competitors: undefined;
  CompetitorProcess: undefined;
  // Add other screens here
};

type CompetitorsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Competitors"
>;

interface CompetitorsScreenProps {
  navigation: CompetitorsScreenNavigationProp;
}
