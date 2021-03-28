import { ID } from '@datorama/akita';

export interface Post {
  id: ID;
  title: string;
  cover: string;
  content: string;
  fileref: string;
}

// use Partial with all properties of Post set to optional
export function createPost(params: Partial<Post>) {
  return {} as Post;
}
