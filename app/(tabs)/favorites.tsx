import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet, Pressable } from "react-native";
import { Card, Title, Paragraph, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article } from "@/constants/types";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Article[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favoriteArticles");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Błąd podczas ładowania ulubionych artykułów:", error);
      }
    };

    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (articleId: string) => {
    try {
      const updatedFavorites = favorites.filter(
        (article) => article.guid !== articleId
      );
      await AsyncStorage.setItem(
        "favoriteArticles",
        JSON.stringify(updatedFavorites)
      );
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Błąd podczas usuwania artykułu z ulubionych:", error);
    }
  };

  return (
    <ScrollView style={{ padding: 10 }}>
      <Text style={styles.title}>Ulubione artykuły</Text>

      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>Brak ulubionych artykułów.</Text>
      ) : (
        favorites.map((article) => (
          <Pressable key={article.guid}>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardContent}>
                  <View style={styles.cardText}>
                    <Title>{article.title}</Title>
                    <Paragraph>
                      {new Date(article.pubDate).toLocaleString()}
                    </Paragraph>
                  </View>
                  <IconButton
                    icon="heart"
                    size={24}
                    onPress={() => handleRemoveFavorite(article.guid)}
                  />
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  noFavoritesText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
  },
});
