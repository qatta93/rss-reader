export type Feed = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

export type Article = {
  title: string;
  pubDate: string;
  link: string;
  content: string;
  guid: string;
  feedId: string;
};
