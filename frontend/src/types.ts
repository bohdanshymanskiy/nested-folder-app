export type NodeItem = {
  id: string;
  parentId: string | null;
  name: string;
  type: "file" | "folder";
  content?: string;
  mimeType?: string;
  order: number;
  isPublic: boolean;
  publicToken?: string;
};

export type PathEntry = { id: string | null; name: string };

export type Permission = "viewer" | "editor";
