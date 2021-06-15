import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToOne, JoinColumn
} from "typeorm";
import { IsNotEmpty } from 'class-validator';
import { CgpSpecialities } from "./cgp-specialities.entity";
import { CgpArticlesTags } from "./cgp-articles-tags.entity";
import { Cgp } from "./cgp.entity";
import { CgpArticlesSubtopics } from "./cgp-articles-subtopics.entity";
import { CgpArticlesSpecialities } from "./cgp-articles-specialities.entity";

@Entity({ name: 'cgp_articles' })
export class CgpArticles {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @IsNotEmpty()
  @Column({ type: 'text', name: 'title', nullable: true })
  title: string;

  @Column({ type: 'text', name: 'description' })
  description: string;

  @Column({ type: 'text', name: 'type', nullable: true })
  type: string;

  @Column({ type: 'text', name: 'article_image', nullable: true })
  articleImage: string;

  @Column({ type: 'text', name: 'article_url', nullable: true })
  articleUrl: string;

  @Column({ type: 'integer', name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ type: 'integer', name: 'updated_by', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: true})
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: true})
  updatedAt: Date;

  // 0 = INACTIVE , 1 = ACTIVE
  @IsNotEmpty()
  @Column({ type: 'boolean', name: 'active', default: 1 })
  active: boolean;

  @IsNotEmpty()
  @Column({ type: 'text', name: 'status', nullable: true})
  status: boolean;

  @IsNotEmpty()
  @Column({ type: 'integer', name: 'article_view', default: 1})
  articleView: number;

  @Column({ type: 'text', name: 'article_editor', nullable: true})
  articleEditor: string;

  @ManyToOne(type => Cgp, cgp => cgp.cgpArticles)
  @JoinColumn({name: 'cgp_id', referencedColumnName: 'id'})
  cgp: Cgp;

  @OneToMany(type => CgpArticlesTags, cgpArticlesTags => cgpArticlesTags.cgpArticles)
  cgpArticlesTags: CgpArticlesTags[];

  @OneToMany(type => CgpArticlesSubtopics, cgpArticlesSubtopics => cgpArticlesSubtopics.cgpArticles)
  cgpArticlesSubtopics: CgpArticlesSubtopics[];

  @OneToMany(type => CgpArticlesSpecialities, cgpArticlesSpecialities => cgpArticlesSpecialities.cgpArticles)
  cgpArticlesSpecialities: CgpArticlesSpecialities[];
}
