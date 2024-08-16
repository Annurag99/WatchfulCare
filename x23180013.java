package org.fog.test.perfeval;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.LinkedList;
import java.util.List;

import org.cloudbus.cloudsim.Host;
import org.cloudbus.cloudsim.Log;
import org.cloudbus.cloudsim.Pe;
import org.cloudbus.cloudsim.Storage;
import org.cloudbus.cloudsim.core.CloudSim;
import org.cloudbus.cloudsim.power.PowerHost;
import org.cloudbus.cloudsim.provisioners.RamProvisionerSimple;
import org.cloudbus.cloudsim.sdn.overbooking.BwProvisionerOverbooking;
import org.cloudbus.cloudsim.sdn.overbooking.PeProvisionerOverbooking;
import org.fog.application.AppEdge;
import org.fog.application.AppLoop;
import org.fog.application.Application;
import org.fog.application.selectivity.FractionalSelectivity;
import org.fog.entities.Actuator;
import org.fog.entities.FogBroker;
import org.fog.entities.FogDevice;
import org.fog.entities.FogDeviceCharacteristics;
import org.fog.entities.Sensor;
import org.fog.entities.Tuple;
import org.fog.placement.Controller;
import org.fog.placement.ModuleMapping;
import org.fog.placement.ModulePlacementEdgewards;
import org.fog.placement.ModulePlacementMapping;
import org.fog.policy.AppModuleAllocationPolicy;
import org.fog.scheduler.StreamOperatorScheduler;
import org.fog.utils.FogLinearPowerModel;
import org.fog.utils.FogUtils;
import org.fog.utils.TimeKeeper;
import org.fog.utils.distribution.DeterministicDistribution;

public class x23180013 {
    // Lists to store fog devices, sensors, and actuators
    static List<FogDevice> fogDevices = new ArrayList<FogDevice>();
    static List<Sensor> sensors = new ArrayList<Sensor>();
    static List<Actuator> actuators = new ArrayList<Actuator>();
    
    // Number of areas and sensors per area
    static int numOfAreas = 2;
    static int numOfSensorsPerArea = 2;
    
    // Sensor transmission time
    static double SENSOR_TRANSMISSION_TIME = 5;
    
    // Flag to indicate whether to use cloud processing
    private static boolean CLOUD = false;

    public static void main(String[] args) {
        Log.printLine("Starting scrap sorting and recycling simulation...");
        try {
            // Disable logging to avoid clutter
            Log.disable();
            
            // Initialize CloudSim
            int num_user = 1; // Number of users
            Calendar calendar = Calendar.getInstance(); // Current calendar instance
            boolean trace_flag = false; // No event tracing
            CloudSim.init(num_user, calendar, trace_flag);
            
            // Application ID
            String appId = "dcns";
            
            // Create FogBroker to manage resources
            FogBroker broker = new FogBroker("broker");
            
            // Create application with appId and broker ID
            Application application = createApplication(appId, broker.getId());
            application.setUserId(broker.getId());
            
            // Create fog devices
            createFogDevices(broker.getId(), appId);
            
            // Controller to manage fog resources
            Controller controller;
            
            // Map modules to devices
            ModuleMapping moduleMapping = ModuleMapping.createModuleMapping();
            if (CLOUD) {
                // Map modules to the cloud if cloud processing is enabled
                moduleMapping.addModuleToDevice("Gyroscope-analysis", "cloud");
                moduleMapping.addModuleToDevice("Accelerometer-analysis", "cloud");
                moduleMapping.addModuleToDevice("Temperature-analysis", "cloud");
                moduleMapping.addModuleToDevice("HeartRate-analysis", "cloud");
                moduleMapping.addModuleToDevice("BloodPressure-analysis", "cloud");
            } else {
                // Map modules to the proxy-server if cloud processing is not used
                moduleMapping.addModuleToDevice("Gyroscope-analysis", "proxy-server");
                moduleMapping.addModuleToDevice("Accelerometer-analysis", "proxy-server");
                moduleMapping.addModuleToDevice("Temperature-analysis", "proxy-server");
                moduleMapping.addModuleToDevice("HeartRate-analysis", "proxy-server");
                moduleMapping.addModuleToDevice("BloodPressure-analysis", "proxy-server");
            }
            
            // Submit application to the controller
            controller = new Controller("master-controller", fogDevices, sensors, actuators);
            controller.submitApplication(application,
                    (CLOUD) ? (new ModulePlacementMapping(fogDevices, application, moduleMapping))
                            : (new ModulePlacementEdgewards(fogDevices, sensors, actuators, application, moduleMapping)));

            // Start simulation
            TimeKeeper.getInstance().setSimulationStartTime(Calendar.getInstance().getTimeInMillis());
            CloudSim.startSimulation();
            CloudSim.stopSimulation();

            Log.printLine("Scrap sorting and recycling simulation completed!");
        } catch (Exception e) {
            e.printStackTrace();
            Log.printLine("Unwanted errors happen");
        }
    }

    // Method to create fog devices
    private static void createFogDevices(int userId, String appId) {
        // Create a cloud device
        FogDevice cloud = createFogDevice("cloud", 44800, 40000, 100, 10000, 0, 0.01, 16*103, 16*83.25);
        cloud.setParentId(-1); // Cloud has no parent
        fogDevices.add(cloud);
        
        // Create a proxy server
        FogDevice proxy = createFogDevice("proxy-server", 2800, 4000, 10000, 10000, 1, 0.0, 107.339, 83.4333);
        proxy.setParentId(cloud.getId()); // Proxy server's parent is the cloud
        proxy.setUplinkLatency(100); // Latency to the cloud
        fogDevices.add(proxy);
        
        // Create areas with sensors
        for (int i = 0; i < numOfAreas; i++) {
            addArea(i + "", userId, appId, proxy.getId());
        }
    }

    // Method to create an area with sensors
    private static FogDevice addArea(String id, int userId, String appId, int parentId) {
        // Create a router for the area
        FogDevice router = createFogDevice("a-" + id, 2800, 4000, 1000, 10000, 2, 0.0, 107.339, 83.4333);
        router.setUplinkLatency(2); // Latency to the proxy server
        fogDevices.add(router);
        
        // Add sensors to the area
        for (int i = 0; i < numOfSensorsPerArea; i++) {
            String sensorId = id + "-" + i;
            FogDevice sensorNode = addSensor(sensorId, userId, appId, router.getId());
            fogDevices.add(sensorNode);
        }
        router.setParentId(parentId); // Set parent of the router to proxy server
        return router;
    }

    // Method to add a sensor to a fog device
    private static FogDevice addSensor(String id, int userId, String appId, int parentId) {
        // Create a sensor node
        FogDevice sensorNode = createFogDevice("s-" + id, 500, 1000, 10000, 10000, 3, 0, 87.53, 82.44);
        sensorNode.setParentId(parentId); // Set parent of sensor node to the router
        
        // Create sensors with their respective types
        Sensor GyroscopeSensor = new Sensor("Gyroscope-" + id, "GYROSCOPE", userId, appId, new DeterministicDistribution(SENSOR_TRANSMISSION_TIME));
        Sensor AccelerometerSensor = new Sensor("Accelerometer-" + id, "ACCELEROMETER", userId, appId, new DeterministicDistribution(SENSOR_TRANSMISSION_TIME));
        Sensor TemperatureSensor = new Sensor("Temperature-" + id, "TEMPERATURE", userId, appId, new DeterministicDistribution(SENSOR_TRANSMISSION_TIME));
        Sensor HeartRateSensor = new Sensor("HeartRate-" + id, "HEARTRATE", userId, appId, new DeterministicDistribution(SENSOR_TRANSMISSION_TIME));
        Sensor BloodPressureSensor = new Sensor("BloodPressure-" + id, "BLOODPRESSURE", userId, appId, new DeterministicDistribution(SENSOR_TRANSMISSION_TIME));

        // Add sensors to the sensors list
        sensors.add(GyroscopeSensor);
        sensors.add(AccelerometerSensor);
        sensors.add(TemperatureSensor);
        sensors.add(HeartRateSensor);
        sensors.add(BloodPressureSensor);

        // Set the gateway device and latency for each sensor
        GyroscopeSensor.setGatewayDeviceId(sensorNode.getId());
        GyroscopeSensor.setLatency(1.0);
        AccelerometerSensor.setGatewayDeviceId(sensorNode.getId());
        AccelerometerSensor.setLatency(1.0);
        TemperatureSensor.setGatewayDeviceId(sensorNode.getId());
        TemperatureSensor.setLatency(1.0);
        HeartRateSensor.setGatewayDeviceId(sensorNode.getId());
        HeartRateSensor.setLatency(1.0);
        BloodPressureSensor.setGatewayDeviceId(sensorNode.getId());
        BloodPressureSensor.setLatency(1.0);

        return sensorNode;
    }

    // Method to create a FogDevice
    private static FogDevice createFogDevice(String nodeName, long mips,
            int ram, long upBw, long downBw, int level, double ratePerMips, double busyPower, double idlePower) {
        
        // Create a list of processing elements (PEs)
        List<Pe> peList = new ArrayList<Pe>();
        
        // Create a PE with a specified MIPS rating and add it to the list
        peList.add(new Pe(0, new PeProvisionerOverbooking(mips))); // Pe id and MIPS rating
        
        // Generate a unique host ID
        int hostId = FogUtils.generateEntityId();
        
        // Host storage and bandwidth settings
        long storage = 1000000; // Host storage
        int bw = 10000;         // Bandwidth

        // Create a PowerHost, which is a host that has power characteristics
        PowerHost host = new PowerHost(
                hostId,
                new RamProvisionerSimple(ram),             // RAM provisioner
                new BwProvisionerOverbooking(bw),          // Bandwidth provisioner
                storage,                                   // Storage
                peList,                                    // List of processing elements
                new StreamOperatorScheduler(peList),       // Scheduler for tasks
                new FogLinearPowerModel(downBw, busyPower, idlePower) // Power model for the host
        );
        
        // List of hosts in the fog device
        List<Host> hostList = new ArrayList<Host>();
        hostList.add(host);

        // Fog device characteristics
        String arch = "x86";       // System architecture
        String os = "Linux";       // Operating system
        String vmm = "Xen";        // Virtual machine monitor (VMM)
        double time_zone = 10.0;   // Time zone where the device is located
        double cost = 3.0;         // Cost of using processing in this device
        double costPerMem = 0.05;  // Cost per MB of memory used
        double costPerStorage = 0.001; // Cost per MB of storage used
        double costPerBw = 0.0;    // Cost per unit of bandwidth used
        
        // List to hold storage devices, currently not adding any SAN devices
        LinkedList<Storage> storageList = new LinkedList<Storage>();

        // Create characteristics object for the fog device
        FogDeviceCharacteristics characteristics = new FogDeviceCharacteristics(
                arch, os, vmm, host, time_zone, cost, costPerMem,
                costPerStorage, costPerBw);

        // Initialize fog device
        FogDevice fogdevice = null;
        try {
            // Create the fog device with the specified characteristics and resource allocation policies
            fogdevice = new FogDevice(nodeName, characteristics, 
                    new AppModuleAllocationPolicy(hostList), storageList, 10, upBw, downBw, 0, ratePerMips);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Set the level of the fog device (cloud, proxy, etc.)
        fogdevice.setLevel(level);
        return fogdevice;
    }

    // Method to create an application
    private static Application createApplication(String appId, int userId) {
        // Create an application with a specified ID and user ID
        Application application = Application.createApplication(appId, userId);

        // Add application modules for processing data from different sensors
        application.addAppModule("Gyroscope-analysis", 10);
        application.addAppModule("Accelerometer-analysis", 10);
        application.addAppModule("Temperature-analysis", 10);
        application.addAppModule("HeartRate-analysis", 10);
        application.addAppModule("BloodPressure-analysis", 10);

        // Define edges between sensors and processing modules
        application.addAppEdge("GYROSCOPE", "Gyroscope-analysis", 1000, 500, "GYROSCOPE_DATA", Tuple.UP, AppEdge.SENSOR);
        application.addAppEdge("ACCELEROMETER", "Accelerometer-analysis", 1000, 500, "ACCELEROMETER_DATA", Tuple.UP, AppEdge.SENSOR);
        application.addAppEdge("TEMPERATURE", "Temperature-analysis", 1000, 500, "TEMPERATURE_DATA", Tuple.UP, AppEdge.SENSOR);
        application.addAppEdge("HEARTRATE", "HeartRate-analysis", 1000, 500, "HEARTRATE_DATA", Tuple.UP, AppEdge.SENSOR);
        application.addAppEdge("BLOODPRESSURE", "BloodPressure-analysis", 1000, 500, "BLOODPRESSURE_DATA", Tuple.UP, AppEdge.SENSOR);

        // Define tuple mappings for processing results
        application.addTupleMapping("Gyroscope-analysis", "GYROSCOPE_DATA", "GYROSCOPE_DATA", new FractionalSelectivity(1.0));
        application.addTupleMapping("Accelerometer-analysis", "ACCELEROMETER_DATA", "ACCELEROMETER_DATA", new FractionalSelectivity(1.0));
        application.addTupleMapping("Temperature-analysis", "TEMPERATURE_DATA", "TEMPERATURE_DATA", new FractionalSelectivity(1.0));
        application.addTupleMapping("HeartRate-analysis", "HEARTRATE_DATA", "HEARTRATE_DATA", new FractionalSelectivity(1.0));
        application.addTupleMapping("BloodPressure-analysis", "BLOODPRESSURE_DATA", "BLOODPRESSURE_DATA", new FractionalSelectivity(1.0));

        // Define the data flow loops (application loops) for the sensors and modules
        List<AppLoop> loops = new ArrayList<AppLoop>();
        loops.add(new AppLoop(Arrays.asList("GYROSCOPE", "Gyroscope-analysis")));
        loops.add(new AppLoop(Arrays.asList("ACCELEROMETER", "Accelerometer-analysis")));
        loops.add(new AppLoop(Arrays.asList("TEMPERATURE", "Temperature-analysis")));
        loops.add(new AppLoop(Arrays.asList("HEARTRATE", "HeartRate-analysis")));
        loops.add(new AppLoop(Arrays.asList("BLOODPRESSURE", "BloodPressure-analysis")));

        // Set loops for the application
        application.setLoops(loops);
        return application;
    }
}
