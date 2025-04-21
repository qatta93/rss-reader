import { ScrollView, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import RenderHtml from "react-native-render-html";
import { Title, Paragraph, Button } from "react-native-paper";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

export default function Article() {
  const { title, pubDate, content, link, from } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const router = useRouter();

  const headerTitle = from === "favorites" ? "Ulubione" : "Lista artykułów";

  const goBackToSource = () => {
    switch (from) {
      case "favorites":
        router.replace("/favorites");
        break;
      case "home":
        router.replace("/");
        break;
      default:
        router.replace("/");
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => goBackToSource()} />
        <Appbar.Content title={headerTitle} />
      </Appbar.Header>

      <ScrollView style={{ padding: 16 }}>
        <Title>{title}</Title>
        <Paragraph>{pubDate}</Paragraph>
        <RenderHtml contentWidth={width} source={{ html: content as string }} />
        <Button
          mode="contained"
          style={{
            marginTop: 16,
            width: 200,
            marginBottom: 50,
            marginHorizontal: "auto",
          }}
          onPress={() => Linking.openURL(link as string)}>
          Czytaj więcej
        </Button>
      </ScrollView>
    </>
  );
}
