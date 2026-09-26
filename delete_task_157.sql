-- 强制删除ID=157的商城任务（级联删除相关领取记录）
-- 先删除该任务的所有领取记录
DELETE FROM task_claims WHERE task_id = 157;

-- 再删除任务本身
DELETE FROM tasks WHERE id = 157;
