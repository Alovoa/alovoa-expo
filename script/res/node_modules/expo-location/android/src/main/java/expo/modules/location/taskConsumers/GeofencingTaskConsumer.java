package expo.modules.location.taskConsumers;

import android.content.Context;
import expo.modules.interfaces.taskManager.TaskConsumer;
import expo.modules.interfaces.taskManager.TaskConsumerInterface;
import expo.modules.interfaces.taskManager.TaskInterface;
import expo.modules.interfaces.taskManager.TaskManagerUtilsInterface;

public class GeofencingTaskConsumer extends TaskConsumer implements TaskConsumerInterface {

  public GeofencingTaskConsumer(Context context, TaskManagerUtilsInterface taskManagerUtils) {
    super(context, taskManagerUtils);
  }

  @Override
  public String taskType() {
    return null;
  }

  @Override
  public void didRegister(TaskInterface task) {
  }

  @Override
  public void didUnregister() {
  }

  //endregion
}
