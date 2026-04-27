export type Permission = "viewer" | "editor";

export interface User {
  id: string;
  email: string;
  password: string;
}

export interface Share {
  id: string;
  nodeId: string;
  ownerId: string;
  email: string;
  permission: Permission;
}

export type NodeType = "file" | "folder";

export interface FileNode {
  id: string;
  parentId: string | null;
  ownerId: string;
  name: string;
  type: NodeType;
  content?: string;
  rawBuffer?: Buffer;
  mimeType?: string;
  order: number;
  isPublic: boolean;
  publicToken?: string;
}
