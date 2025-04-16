import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import axios from "axios";

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Card key={item.guid} style={{ margin: 10 }}>
          <Card.Content>
            <Title>{item.title}</Title>
            <Paragraph>{item.pubDate}</Paragraph>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
