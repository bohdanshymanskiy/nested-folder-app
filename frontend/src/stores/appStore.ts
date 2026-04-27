import { makeAutoObservable, runInAction } from "mobx";
import { api, setAuthToken } from "../api/client";
import type { NodeItem, PathEntry } from "../types";

class AppStore {
  token: string | null = null;
  pathStack: PathEntry[] = [{ id: null, name: "Root" }];
  search = "";

  constructor() {
    makeAutoObservable(this);
  }

  get currentParentId(): string | null {
    return this.pathStack[this.pathStack.length - 1].id;
  }

  async register(email: string, password: string) {
    const { data } = await api.post<{ token: string }>("/auth/register", {
      email,
      password,
    });
    runInAction(() => {
      this.token = data.token;
    });
    setAuthToken(data.token);
  }

  async login(email: string, password: string) {
    const { data } = await api.post<{ token: string }>("/auth/login", {
      email,
      password,
    });
    runInAction(() => {
      this.token = data.token;
    });
    setAuthToken(data.token);
  }

  logout() {
    this.token = null;
    this.pathStack = [{ id: null, name: "Root" }];
    this.search = "";
    setAuthToken(null);
  }

  navigateInto(node: NodeItem) {
    this.pathStack.push({ id: node.id, name: node.name });
    this.search = "";
  }

  navigateTo(index: number) {
    this.pathStack = this.pathStack.slice(0, index + 1);
    this.search = "";
  }
}

export const appStore = new AppStore();
