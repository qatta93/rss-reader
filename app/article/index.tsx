import { ScrollView, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import RenderHtml from "react-native-render-html";
import { Title, Paragraph, Button } from "react-native-paper";
import { Appbar } from "react-native-paper";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

export default function Article() {
  const { title, pubDate, content, link } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const router = useRouter();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Lista artykułów" />
      </Appbar.Header>
      <ScrollView style={{ padding: 16 }}>
        <Title>{title}</Title>
        <Paragraph>{pubDate}</Paragraph>
        <RenderHtml contentWidth={width} source={{ html: content as string }} />
        <Button
          mode="contained"
          style={{ marginTop: 16 }}
          onPress={() => Linking.openURL(link as string)}>
          Czytaj więcej
        </Button>
      </ScrollView>
    </>
  );
}
