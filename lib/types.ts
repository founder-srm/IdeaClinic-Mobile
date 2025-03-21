interface Post {
  id: string;
  title: string;
  content: string | null;
  banner_url: string | null;
  label: string;
  label_color: string;
  created_at: string;
  likes: string[] | null;
  creator_id: string | null;
}

interface Creator {
  username: string;
  avatar_url: string | null;
  full_name: string | null;
}

interface Comment {
  id: string;
  content: string | null;
  created_at: string;
  creatorid: string | null;
  likes: string[] | null;
  postid: string | null;
  creator: {
    username: string | null;
    avatar_url: string;
    full_name: string | null;
  } | null;
}

export type PostWithAddons = Post & {
  creator?: {
    avatar_url: string;
    full_name: string;
  };
  likesCount: number;
  isLiked?: boolean;
};

export type ForumPost = {
  banner_url: string | null;
  content: string | null;
  created_at: string;
  creator_id: string | null;
  id: string;
  label: string;
  label_color: string;
  title: string;
  likes: string[];
  creator?: {
    avatar_url: string;
    full_name: string;
  };
  likesCount: number;
  isLiked: boolean;
};

export type { Post, Creator, Comment };
