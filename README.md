###############################################################################
SETUP:
###############################################################################
Software Intall:
Git clone application (https://github.com/kamalgajen/Tascule.git)
node
npm
Heroku toolbelt (https://toolbelt.heroku.com)
Hadoop (Optional: only required if running Hbase in distributed cluster mode)
Hbase 

Note: Install script provided for ubuntu (setup-ubuntu.sh) - just run this to setup most of the software (everything except hadoop & hbase) required for the application to run.

Properties:
Copy Constants.js.sample to Constants.js and update the apropriate values

Configure Hadoop (Optional):
Configure hadoop appropriately.  Remember to update the config files and run namenode format.  
NOTE: this step is required only if you want to run Taskcule in distributed mode.

Configure Hbase:
You can run hbase locally or in a hadoop cluster.  To run hbase locally, just change the hbase.rootdir in hbase-site.xml to a data drive.  That's the only change that's required.  Refer to http://hbase.apache.org/book/quickstart.html for further details.  To run hbase in a distributed, set the hbase.rootdir to your hdfs directory for hbase data, hbase.cluster.distributed to true, hbase.zookeeper.quorum to localhost and hbase.zookeeper.property.dataDir to a hdfs directory for zookeeper files.  Refer to http://hbase.apache.org/book/standalone_dist.html for further details.

Set environment:
source setenv.sh

Start servers:
If you are using Hadoop, run "bin/start-all.sh" to get all the hadoop related processes started - 
   cd <HADOOP INSTALL DIRECTORY>
   bin/start_all.sh

Start the hbase and thrift servers, and create required tables - 

    cd <HBASE INSTALL DIRECTORY>
    bin/start-hbase.sh
    bin/hbase thrift start

    -- first/one time only --
    bin/hbase shell
        create 'todo', 'cf'
        exit

Start server:
    foreman start


###############################################################################
DOCUMENTATION
###############################################################################
Taskcule is a workload management tool, which integrates a custom todo management tool, along with other daily use products like Rally (for user stories), Bugzilla, etc. for software professionals.

The goal is to provide a single platform where a software professional can see all their work day items.  Calendar items can be plugged in as well (eventually).

The application is built on a full java script stack, using 3 of the 4 technologies in the [MEAN] (www.mean.io) stack: [Express] (http://expressjs.com), [Angular] (http://angularjs.com), and [Node] (http://nodejs.com).  [MongoDB] (http://mongodb.com) is replaced by Hbase (http://hbase.apache.org) in this project.

We use [Express] (http://expressjs.org) to set up our web server. Review [web.js](web.js) and [routes.js](routes.js) for app setup and the valid routes. The static assets are in [/public](public/) subdirectories.  Express is used here to organize the functions that are executed on the server to generate an HTTP response from an HTTP request - that is, to structure our webapp.

Hbase is the data store and stores the tasks as a json blob.  The server interacts with Hbase via [Thrift adapter] (http://hbase.apache.org/apidocs/org/apache/hadoop/hbase/thrift/doc-files/Hbase.html).  Hbase provides a native REST API, but THRIFT was used for performance reasons - check out http://stackoverflow.com/questions/16732082/hbase-thrift-vs-rest-performance for more details.

// sample data structure for tasks json
[
    {
      "id" : "2",
      "name" : "hello there",
      "completed" : "true"
    },
    {
      "id" : "1",
      "name" : "evaluate Taskcule and give feedback",
      "completed" : "false"
    }
];


The projects also demonstrates both server side and client side javascript templating.  The server side templating is done with Embedded JS templates (http://embeddedjs.com).  Check out *.ejs, routes.js and Constants.js.  Angularjs helps with the client side templating fucntionality.  Check out *.ejs, routes.js and controllers.js.

Check out the Rally module for REST API interaction.

OAuth is used for logging into Taskcule.  Currently only configured to use Google, but can easily be enhanced to support other sites like Facebook, Github, LinkedIn, etc.

Google analytics plug in provided as well to monitor site usage.

No passwords is stored in the system and sent to Taskcule server.  Since there is no SSL support for Taskcule yet, the system was designed as such.  

The login details for external systems - 

Rally: We use Rally's internal authentication (SSL enabled) to login in a user.  [Crypto.js] (http://code.google.com/p/crypto-js/) is used to encrypt and store the password in the cookie.  We use AES-256, with security key to prevent unauthorized access to this password.  We need the base-64 username:password to be passed along with each REST calls to Rally.  

Bugzilla: TO BE DONE

Github: TO BE DONE

