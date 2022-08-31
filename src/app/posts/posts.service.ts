import { Post } from  './post.model';
import { Injectable } from '@angular/core';
import { map, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class PostsService {

  private posts: Post[]= [];
  private postUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}
  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
    .pipe(map((postData) => {
      return postData.posts.map((post: { title: any; content: any; _id: any; }) => {
        return {
          title: post.title,
          content: post.content,
          id: post._id
        };
      });
    }))
    .subscribe((transferedPost) => {
      this.posts = transferedPost;
      this.postUpdated.next([...this.posts]);
    });
  }

  getPostUpdateListener(){
    return this.postUpdated.asObservable();
  }
  addPost(title: string, content: string) {
    const post: Post= {
      title: title, content: content, id: ''
    };
    this.http.post<{message:string, postId: string}>('http://localhost:3000/api/posts',post)
    .subscribe((responseData)=> {
      const postId = responseData.postId;
      post.id = postId;
      this.posts.push(post);
      this.postUpdated.next([...this.posts]);
    });
  }

  deletePost(postId: string) {
    console.log("id= "+postId);

    this.http.delete('http://localhost:3000/api/posts/' + postId)
    .subscribe(() => {
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postUpdated.next([...this.posts]);
    });
  }
}

