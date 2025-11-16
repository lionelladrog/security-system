CREATE TABLE `attendance_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `attendance_status_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_status_name_unique` UNIQUE(`name`),
	CONSTRAINT `idx_attendance_status_name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `site` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`geolocation` varchar(255),
	`owner_id` int,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `site_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_name_unique` UNIQUE(`name`),
	CONSTRAINT `idx_site_name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `staff_attendance_record` (
	`id` int AUTO_INCREMENT NOT NULL,
	`staff_id` int NOT NULL,
	`date` date NOT NULL,
	`status_id` int,
	`check_in` time NOT NULL,
	`check_out` time NOT NULL,
	`break_time` int NOT NULL DEFAULT 0,
	`hours` decimal(4,2),
	`site_id` int NOT NULL,
	`travel_allowance` decimal(10,2) DEFAULT '0',
	`notes` text,
	`has_pending_request` boolean DEFAULT false,
	`approved_by` int NOT NULL,
	`approved_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `staff_attendance_record_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff_member` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employee_id` varchar(50) NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`email` varchar(255) DEFAULT '',
	`phone` varchar(20),
	`position` varchar(100),
	`department` varchar(100),
	`hire_date` date DEFAULT CURRENT_TIMESTAMP,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `staff_member_id` PRIMARY KEY(`id`),
	CONSTRAINT `staff_member_employee_id_unique` UNIQUE(`employee_id`),
	CONSTRAINT `idx_staff_members_employee_id` UNIQUE(`employee_id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`),
	CONSTRAINT `idx_user_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `idx_staff_attendance_records_staff_id` ON `staff_attendance_record` (`staff_id`);--> statement-breakpoint
CREATE INDEX `idx_site_attendance_records_site_id` ON `staff_attendance_record` (`site_id`);--> statement-breakpoint
CREATE INDEX `idx_staff_members_user_id` ON `staff_member` (`user_id`);