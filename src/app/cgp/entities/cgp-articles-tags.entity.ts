import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CgpArticles } from './cgp_articles.entity';
import { SubtopicTags } from './subtopic-tags.entity';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'cgp_articles_tags' })
export class CgpArticlesTags {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @IsNotEmpty()
  @Column({ type: 'boolean', name: 'status', default: 1 })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    select: false,
    nullable: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    select: false,
    nullable: true,
  })
  updatedAt: Date;

  @ManyToOne(
    (type) => CgpArticles,
    (cgpArticles) => cgpArticles.cgpArticlesTags,
  )
  @JoinColumn({ name: 'article_id', referencedColumnName: 'id' })
  cgpArticles: CgpArticles;

  @ManyToOne(
    (type) => SubtopicTags,
    (subtopicTags) => subtopicTags.cgpArticlesTags,
  )
  @JoinColumn({ name: 'tags_id', referencedColumnName: 'id' })
  subtopicTags: SubtopicTags;
}
