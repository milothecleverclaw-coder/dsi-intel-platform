CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`dataset_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`created_by_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
