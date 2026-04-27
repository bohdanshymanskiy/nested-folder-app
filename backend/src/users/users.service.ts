import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { User } from "../types";

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(email: string, password: string): User {
    const user: User = { id: randomUUID(), email, password };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}
