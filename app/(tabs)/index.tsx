import { useEffect, useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const res = await axios.get("https://api.rss2json.com/v1/api.json", {
          params: {
            rss_url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
          },
        });
        setArticles(res.data.items);
      } catch (error) {
        console.error("Błąd podczas pobierania RSS:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRSS();
  }, []);

  if (loading) return <ActivityIndicator animating={true} />;

  return (
    <ScrollView>
      {articles.map((item) => (
        <Pressable
          key={item.guid}
          onPress={() =>
            router.push({
              pathname: "../article",
              params: {
                title: item.title,
                pubDate: item.pubDate,
                content: item.content || item.description,
                link: item.link,
              },
            })
          }>
          <Card
            key={item.guid}
            style={{ margin: 10 }}
            onPress={() =>
              router.push({
                pathname: "../article",
                params: {
                  title: item.title,
                  pubDate: item.pubDate,
                  content: item.content,
                  link: item.link,
                },
              })
            }>
            <Card.Content>
              <Title>{item.title}</Title>
              <Paragraph>{item.pubDate}</Paragraph>
            </Card.Content>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
