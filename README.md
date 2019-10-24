# atom-velocity-validate package

Validates and Evaluates Apache Velocity Templates.

## Requirements
Download this velocity-validator JAR
https://github.com/carlogodoy/velocity-validator/blob/master/bin/velocity-validator-1.0.jar

Alternatively you can build it from source:
https://github.com/carlogodoy/velocity-validator

Must do:
-establish a "repo" directory for the required files
-all required files must be added to this directory
-For basic operation, you only require the velocity-validate jar file

# Velocity Validate
Validate: indicates the errors in the velocity template file.

# Velocity Evaluate
Evaluate: generates the output from the velocity template file.

# Advanced Operation
Supporting Velocity (evaluate only) java properties, methods, classes
	-Velocity has access to Java objects from the invoking java program.
		For example: #set($myvar = $myJavaVar.getAttribute('some_string'))
			In this example the variable myJavaVar is a class instance from Java and 'getAttribute' is a class method.
	-To evaluate a velocity template that uses such Java methods, say as a test-suite, this requires 
         the Java class (in jar form) and the java variable to be defined
	-add the jars to the REPO directory and add the jar filename to the External Jars filenames list setting (see Settings below)
	-if there are dependency jars, add those too
	-indicate the java variables, for the example above this is 'myJavaVar', this is done
	 in the Preload Object Vars setting (see Settings below)
	-Finally, create a preload Template file (see Preload Template below)

	You May need this if:
	-if you have Velocity templates using Java methods or poperties and you want to evaluate the velocity template _outside_ 
         the Java application, say as a unit test or test automation/validation


# Settings : setting up package once installed in Atom
-Atom velocity-validator settings:
	-Repo Path: All Jars, preload files must be found in this directory.
	-Velocity Jar Filename: default is 'velocity-validator-1.0.jar'
	-(optional) External Jars filenames list, semi-colon delimited
	-(optional) Preload Object Vars: Format var_name:fully_qualified_class_name> ; ...  '
                        Example var1:org.domain.name.TheClassName;var1:org.ee.AnotherClass

# Activate Velocity Validator Package
-Open a Velocity file in Atom
-Select Menu Package -> atom-velocity-validate -> Toggle
-Or right-click and select 'Toggle atom-velocity-validate'
-You will see the Velocity Validator appear on the Panel to the right
-You see Toolbar buttons: Validate, Evaluate, +, - , Clear, Hide
-Validate and Evaluate buttons are obvious
-The +,- increase/decrease Font size
-"Clear" wipes the red output box below
-"Hide" shifts the plugin planel out of the way, you can show it again by using menu or right click to toggle
-"Use Preload file" allows you to select a Preload file (See Preload Template)
-"Write Eval to file" allows output from Evaluate to go to a file, if not set it just uses the output panel
-"Velocity file" text specifies the file being active
-Finally the Output panel, that is where the output all goes


# Preload Template (Optional)
-Preload template is a velocity template that gets merged with the Active velocity template
-With a preload template you can validate the active template
-A scenario:
  -Active Template for xml might have: ($myVar = $someJavaVar)  <name>$myVar</name>
  -Preload Template could then have: ($someJavaVar = "1234")
  -So when Evaluated, the output is=> <name>1234</name>
  -Without the Preload Template, the output would be=> <name>$myvar</name>

  This is only useful if your current workflow has external variables external to the Velocity Template
   ...And you want to evaluate the template outside the context, say for testing, automation, validation.


# Output File
"Write Eval to file" allows output from Evaluate to go to a file, if not set it just uses the output panel


![A screenshot of your package](https://raw.githubusercontent.com/carlogodoy/atom-velocity-validate/master/assets/screen-cap.png)
