import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { FileNode, Permission, Share } from "../types";
import { UsersService } from "../users/users.service";

@Injectable()
export class FilesService {
  private readonly nodes: FileNode[] = [];
  private readonly shares: Share[] = [];

  constructor(private readonly usersService: UsersService) {}

  listForUser(userId: string, parentId: string | null, query: string) {
    return this.nodes
      .filter((node) => this.hasAccess(node, userId))
      .filter((node) => node.parentId === parentId)
      .filter((node) => node.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.order - b.order);
  }

  createFolder(userId: string, parentId: string | null, name: string) {
    return this.createNode(userId, parentId, name, "folder");
  }

  createFile(userId: string, parentId: string | null, name: string, content: string) {
    return this.createNode(userId, parentId, name, "file", content);
  }

  uploadFile(
    userId: string,
    parentId: string | null,
    name: string,
    buffer: Buffer,
    mimeType: string,
  ) {
    if (parentId) this.requireEditable(userId, parentId);
    const node: FileNode = {
      id: randomUUID(),
      ownerId: userId,
      parentId,
      name,
      type: "file",
      rawBuffer: buffer,
      mimeType,
      order: this.nextOrder(parentId),
      isPublic: false,
    };
    this.nodes.push(node);
    return node;
  }

  rename(userId: string, id: string, name: string) {
    const node = this.requireEditable(userId, id);
    node.name = name;
    return node;
  }

  updateContent(userId: string, id: string, content: string) {
    const node = this.requireEditable(userId, id);
    if (node.type !== "file") {
      throw new ForbiddenException("Only file can be edited");
    }
    node.content = content;
    return node;
  }

  toggleVisibility(userId: string, id: string, isPublic: boolean) {
    const node = this.requireEditable(userId, id);
    node.isPublic = isPublic;
    node.publicToken = isPublic ? (node.publicToken ?? randomUUID()) : undefined;
    return node;
  }

  reorder(userId: string, parentId: string | null, order: string[]) {
    const siblings = this.nodes.filter(
      (node) => node.parentId === parentId && this.hasAccess(node, userId),
    );
    const allowedIds = new Set(siblings.map((node) => node.id));
    order.forEach((id, index) => {
      if (allowedIds.has(id)) {
        const node = this.nodes.find((item) => item.id === id);
        if (node) node.order = index;
      }
    });
    return this.listForUser(userId, parentId, "");
  }

  clone(userId: string, id: string) {
    const node = this.requireReadable(userId, id);
    const clone: FileNode = {
      ...node,
      id: randomUUID(),
      name: `${node.name} (copy)`,
      ownerId: userId,
      order: this.nextOrder(node.parentId),
      publicToken: undefined,
      isPublic: false,
    };
    this.nodes.push(clone);
    return clone;
  }

  remove(userId: string, id: string) {
    this.requireEditable(userId, id);
    const idsToDelete = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      this.nodes.forEach((node) => {
        if (node.parentId && idsToDelete.has(node.parentId) && !idsToDelete.has(node.id)) {
          idsToDelete.add(node.id);
          changed = true;
        }
      });
    }
    for (let i = this.nodes.length - 1; i >= 0; i -= 1) {
      if (idsToDelete.has(this.nodes[i].id)) {
        this.nodes.splice(i, 1);
      }
    }
    return { removed: [...idsToDelete] };
  }

  shareByEmail(userId: string, nodeId: string, email: string, permission: Permission) {
    this.requireEditable(userId, nodeId);
    const existingIdx = this.shares.findIndex((s) => s.nodeId === nodeId && s.email === email);
    if (existingIdx >= 0) this.shares.splice(existingIdx, 1);
    const share: Share = { id: randomUUID(), nodeId, ownerId: userId, email, permission };
    this.shares.push(share);
    return share;
  }

  getByPublicToken(token: string) {
    const node = this.nodes.find((item) => item.publicToken === token && item.isPublic);
    if (!node) throw new NotFoundException("Public link not found");
    return node;
  }

  getFileBuffer(userId: string, id: string) {
    const node = this.requireReadable(userId, id);
    if (!node.rawBuffer) throw new BadRequestException("Node has no binary content");
    return { buffer: node.rawBuffer, mimeType: node.mimeType!, name: node.name };
  }

  private createNode(
    userId: string,
    parentId: string | null,
    name: string,
    type: "file" | "folder",
    content?: string,
  ) {
    if (parentId) this.requireEditable(userId, parentId);
    const node: FileNode = {
      id: randomUUID(),
      ownerId: userId,
      parentId,
      name,
      type,
      content,
      order: this.nextOrder(parentId),
      isPublic: false,
    };
    this.nodes.push(node);
    return node;
  }

  private requireReadable(userId: string, id: string) {
    const node = this.nodes.find((item) => item.id === id);
    if (!node) throw new NotFoundException("Node not found");
    if (!this.hasAccess(node, userId)) throw new ForbiddenException("No permission");
    return node;
  }

  private requireEditable(userId: string, id: string) {
    const node = this.requireReadable(userId, id);
    if (node.ownerId === userId) return node;
    const userEmail = this.usersService.findById(userId)?.email;
    const share = this.shares.find(
      (item) => item.nodeId === id && item.permission === "editor" && item.email === userEmail,
    );
    if (!share) throw new ForbiddenException("No edit permission");
    return node;
  }

  private hasAccess(node: FileNode, userId: string): boolean {
    if (node.ownerId === userId) return true;
    const userEmail = this.usersService.findById(userId)?.email;
    if (!userEmail) return false;
    return this.shares.some((share) => share.nodeId === node.id && share.email === userEmail);
  }

  private nextOrder(parentId: string | null) {
    return this.nodes.filter((node) => node.parentId === parentId).length;
  }
}
